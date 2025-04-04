import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { parsePaginationAndSorting } from 'src/utils/pagination.helper';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { medical_event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendMedicalEventDto } from './dto/attend-medical-event.dto';
import { VitalSignsService } from '../modules/vital-signs/vital-signs.service';
import { PhysicalExplorationService } from '../modules/physical-exploration-data/physical-exploration/physical-exploration.service';
import { PhysicalExaminationService } from '../modules/physical-examination-data/physical-examination/physical-examination.service';
import { EmailService } from 'src/services/email/email.service';
import { TwilioService } from 'src/services/twilio/twilio.service';
import { medicationHtml } from 'src/services/email/templates/medicationHtml';

@Injectable()
export class MedicalEventsService {
  constructor(
    private prisma: PrismaService,
    private vitalSignsService: VitalSignsService,
    private physicalExplorationService: PhysicalExplorationService,
    private physicalExaminationService: PhysicalExaminationService,
    private emailService: EmailService,
    private twilioService: TwilioService,
  ) {}

  async createMedicalEvent(
    data: CreateMedicalEventDto,
    tenant_id: string,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.medical_event.create({
        data: {
          appointment_id: data.appointment_id,
          patient_id: data.patient_id,
          physician_id: data.physician_id,
          physician_comments: data.physician_comments ?? '',
          main_diagnostic_cie: data.main_diagnostic_cie ?? '',
          evolution: data.evolution ?? '',
          procedure: data.procedure ?? '',
          treatment: data.treatment ?? '',
          tenant_id: tenant_id,
        },
      });

      return { message: `Evento médico creado exitosamente` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el evento médico: ${error.message}`,
      );
    }
  }

  async getMedicalEvents(filters?: {
    patient_id?: string;
    physician_id?: string;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<medical_event[]> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(filters);

    try {
      const medicalEvents = await this.prisma.medical_event.findMany({
        where: {
          ...(filters?.patient_id && { patient_id: filters.patient_id }),
          ...(filters?.physician_id && { physician_id: filters.physician_id }),
        },
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      });

      return medicalEvents;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los eventos médicos',
        error.message,
      );
    }
  }

  async attendMedicalEvent(
    attendMedicalEventDto: AttendMedicalEventDto,
    userId: string,
    tenant_id: string,
  ) {
    try {
      const {
        id,
        vital_signs,
        physical_explorations,
        physical_examinations,
        subcategory_cie_ids,
        main_diagnostic_cie,
        consultation_ended,
        medications,
        ...basicData
      } = attendMedicalEventDto;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const medicalEvent = await this.prisma.medical_event.findUnique({
        where: {
          id,
          deleted: false,
        },
        include: {
          appointment: true,
          physician: true,
          subcategory_medical_event: {
            include: {
              subcategories_cie_diez: true,
            },
          },
        },
      });

      if (!medicalEvent) {
        throw new NotFoundException('Evento médico no encontrado');
      }

      const isSuperAdmin = user.is_superadmin;
      const isAssignedPhysician = medicalEvent.physician.id === userId;

      if (!isSuperAdmin && !isAssignedPhysician) {
        throw new ForbiddenException(
          'No tiene permisos para atender esta consulta',
        );
      }

      const appointmentFinished =
        medicalEvent.appointment.status === 'atendida';
      const gracePeriodValid = this._isWithinGracePeriod(
        medicalEvent.updated_at,
      );

      if (appointmentFinished && !gracePeriodValid && !isSuperAdmin) {
        throw new ForbiddenException(
          'La consulta ya fue atendida y ha pasado el período de gracia de 24 horas para modificarla',
        );
      }

      if (main_diagnostic_cie) {
        const subcategoryCodes = medicalEvent.subcategory_medical_event.map(
          (subCat) => subCat.subcategories_cie_diez.code,
        );

        if (
          subcategoryCodes.length > 0 &&
          !subcategoryCodes.includes(main_diagnostic_cie)
        ) {
          throw new BadRequestException(
            'El diagnóstico principal debe ser una de las subcategorías CIE-10 asociadas al evento',
          );
        }
      }

      // Actualizar el evento médico en una transacción
      return await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar datos básicos del evento médico
        await tx.medical_event.update({
          where: { id },
          data: {
            ...basicData,
            main_diagnostic_cie,
            updated_at: new Date(),
          },
        });

        // 2. Actualizar signos vitales si se proporcionaron
        if (vital_signs && vital_signs.length > 0) {
          await this.vitalSignsService.create({
            patient_id: medicalEvent.patient_id,
            tenant_id,
            medical_event_id: id,
            vital_signs,
          });
        }

        // 3. Actualizar las subcategorías CIE-10 si se proporcionaron
        if (subcategory_cie_ids && subcategory_cie_ids.length > 0) {
          // Obtener las subcategorías actuales
          const currentSubcategories =
            await tx.subcategory_medical_event.findMany({
              where: { medical_eventId: id },
            });

          // Determinar subcategorías a eliminar
          const currentSubcategoryIds = currentSubcategories.map(
            (sub) => sub.subCategoryId,
          );
          const subcategoryIdsToDelete = currentSubcategoryIds.filter(
            (currentId) => !subcategory_cie_ids.includes(currentId),
          );

          // Determinar subcategorías a crear
          const subcategoryIdsToCreate = subcategory_cie_ids.filter(
            (newId) => !currentSubcategoryIds.includes(newId),
          );

          // Eliminar subcategorías que ya no están en la lista
          if (subcategoryIdsToDelete.length > 0) {
            await tx.subcategory_medical_event.deleteMany({
              where: {
                medical_eventId: id,
                subCategoryId: { in: subcategoryIdsToDelete },
              },
            });
          }

          // Crear nuevas subcategorías
          for (const subCategoryId of subcategoryIdsToCreate) {
            await tx.subcategory_medical_event.create({
              data: {
                medical_eventId: id,
                subCategoryId,
              },
            });
          }
        }

        // 4. Actualizar exploraciones físicas si se proporcionaron
        if (physical_explorations && physical_explorations.length > 0) {
          // La exploración física es única por evento médico, así que actualizamos o creamos una
          const exploration = physical_explorations[0]; // Tomamos la primera
          await this.physicalExplorationService.createPhysicalExploration({
            patient_id: medicalEvent.patient_id,
            physician_id: medicalEvent.physician_id,
            medical_event_id: id,
            tenant_id,
            description: exploration.description,
            physical_exploration_area_id:
              exploration.physical_exploration_area_id,
          });
        }

        // 5. Actualizar exámenes físicos si se proporcionaron
        if (physical_examinations && physical_examinations.length > 0) {
          // Transformar los datos para que sean compatibles con el servicio de examen físico
          const formattedExaminations = physical_examinations.map((exam) => ({
            patient_id: medicalEvent.patient_id,
            description: exam.description,
            medical_event_id: id,
            tenant_id,
            physical_subsystem_id: exam.physical_subsystem_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          console.log('formattedExaminations', formattedExaminations);
          await this.physicalExaminationService.create(formattedExaminations);
        }

        // 6. Si se proporcionaron medicaciones, procesarlas
        if (medications && medications.length > 0) {
          // Procesamos cada medicación
          for (const medication of medications) {
            // Verificamos si ya existe una prescripción activa para este medicamento
            const existingPrescription = await tx.prescription.findFirst({
              where: {
                patient_id: medicalEvent.patient_id,
                monodrug: medication.monodrug,
                active: true,
              },
            });

            if (existingPrescription) {
              // Si ya existe una prescripción activa, crear una nueva entrada en el historial
              await tx.pres_mod_history.create({
                data: {
                  prescription_id: existingPrescription.id,
                  physician_id: userId,
                  medical_event_id: id,
                  observations: medication.observations,
                  dose: medication.dose,
                  dose_units: medication.dose_units,
                  frecuency: medication.frecuency,
                  duration: medication.duration,
                  duration_units: medication.duration_units,
                },
              });
            } else {
              // Si no existe, crear nueva prescripción y su primer entrada en el historial
              const newPrescription = await tx.prescription.create({
                data: {
                  patient_id: medicalEvent.patient_id,
                  monodrug: medication.monodrug,
                  active: true,
                  authorized: true,
                  tenant_id,
                },
              });

              // Crear la primera entrada en el historial
              await tx.pres_mod_history.create({
                data: {
                  prescription_id: newPrescription.id,
                  physician_id: userId,
                  medical_event_id: id,
                  observations: medication.observations,
                  dose: medication.dose,
                  dose_units: medication.dose_units,
                  frecuency: medication.frecuency,
                  duration: medication.duration,
                  duration_units: medication.duration_units,
                },
              });
            }
          }

          // Si la consulta está siendo finalizada, enviar notificación
          if (consultation_ended) {
            const patient = await tx.user.findUnique({
              where: { id: medicalEvent.patient_id },
            });

            const physician = await tx.user.findUnique({
              where: { id: userId },
            });

            // Buscar si hay alguna orden médica asociada para obtener la URL del archivo
            let prescriptionFileUrl: string | undefined;
            try {
              const medicalOrder = await tx.medical_order.findFirst({
                where: {
                  patient_id: medicalEvent.patient_id,
                  physician_id: userId,
                  medical_order_type: {
                    name: {
                      in: ['medication', 'medication-authorization'],
                    },
                  },
                },
                orderBy: {
                  request_date: 'desc',
                },
              });

              if (medicalOrder?.url) {
                prescriptionFileUrl = medicalOrder.url;
              }
            } catch (error) {
              console.error(
                'Error al buscar orden médica para obtener URL:',
                error,
              );
              // Continuar sin URL si hay error
            }

            if (patient) {
              this._sendMedicationNotification(
                patient,
                medications,
                physician?.name,
                prescriptionFileUrl,
              );
            }
          }
        }

        // 7. Si se indicó finalizar la consulta, actualizar el estado de la cita
        if (consultation_ended) {
          await tx.appointment.update({
            where: { id: medicalEvent.appointment_id },
            data: {
              status: 'atendida',
              updated_at: new Date(),
            },
          });
        }

        return {
          message: 'Consulta médica actualizada exitosamente',
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al atender consulta: ${error.message}`,
      );
    }
  }

  private _isWithinGracePeriod(date: Date): boolean {
    const gracePeriodHours = 24;
    const now = new Date();
    const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;

    return now.getTime() - date.getTime() <= gracePeriodMs;
  }

  private async _sendMedicationNotification(
    patient,
    medications,
    physicianName,
    fileUrl?: string,
  ) {
    try {
      // Preparar adjuntos si hay una URL del documento
      let attachments = [];
      if (fileUrl) {
        try {
          const attachment =
            await this.emailService.getAttachmentFromUrl(fileUrl);
          attachments = [attachment];
        } catch (attachmentError) {
          console.error(
            'Error al preparar el archivo adjunto:',
            attachmentError,
          );
          // Continuar sin adjunto si hay error
        }
      }

      if (patient.email) {
        const emailContent = medicationHtml(
          patient.name,
          patient.last_name || '',
          medications,
          physicianName,
        );
        await this.emailService.sendMail(
          patient.email,
          `Nuevas medicaciones prescritas`,
          emailContent,
          attachments.length > 0 ? attachments : undefined,
        );
      }

      if (patient.phone && patient.is_phone_verified) {
        const medicationListText = medications
          .map(
            (med) =>
              `• ${med.monodrug}: ${med.dose} ${med.dose_units}, ${med.frecuency}, por ${med.duration} ${med.duration_units}` +
              (med.observations
                ? `\n  _Observaciones: ${med.observations}_`
                : ''),
          )
          .join('\n');

        const whatsappMessage = `Hola ${patient.name},

Durante su consulta, el Dr./Dra. ${physicianName || 'su médico'} ha prescrito las siguientes medicaciones:

${medicationListText}

Por favor, siga las indicaciones de su médico y tome sus medicamentos según lo prescrito.

SEGIMED - Sistema de Gestión Médica`;

        // Si hay URL del documento, enviar con archivo adjunto
        if (fileUrl) {
          await this.twilioService.sendWhatsAppWithMedia(
            patient.phone,
            whatsappMessage,
            fileUrl,
          );
        } else {
          await this.twilioService.sendOtp(patient.phone, whatsappMessage);
        }
      }
    } catch (error) {
      console.error('Error sending medication notification:', error);
      // No lanzar error, seguir con el flujo
    }
  }
}
