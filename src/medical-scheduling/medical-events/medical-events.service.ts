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
import { PrescriptionService } from '../modules/prescription/prescription.service';
import { NotificationService } from 'src/services/notification/notification.service';

@Injectable()
export class MedicalEventsService {
  constructor(
    private prisma: PrismaService,
    private vitalSignsService: VitalSignsService,
    private physicalExplorationService: PhysicalExplorationService,
    private physicalExaminationService: PhysicalExaminationService,
    private prescriptionService: PrescriptionService,
    private notificationService: NotificationService,
  ) {}
  async createMedicalEvent(
    data: CreateMedicalEventDto,
    tenant_id: string,
  ): Promise<{ message: string }> {
    try {
      // Validar especialidad del médico si se proporciona specialty_id
      if (data.specialty_id) {
        await this.validatePhysicianSpecialty(
          data.physician_id,
          data.specialty_id,
        );
      }

      await this.prisma.medical_event.create({
        data: {
          appointment_id: data.appointment_id,
          patient_id: data.patient_id,
          physician_id: data.physician_id,
          physician_comments: data.physician_comments ?? '',
          main_diagnostic_cie_id: data.main_diagnostic_cie,
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
    specialty_id?: number;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<medical_event[]> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(filters);

    try {
      // Construir whereConditions dinámicamente
      const whereConditions: any = {};

      if (filters?.patient_id) {
        whereConditions.patient_id = filters.patient_id;
      }

      if (filters?.physician_id) {
        whereConditions.physician_id = filters.physician_id;
      } // Filtro por especialidad médica
      if (filters?.specialty_id) {
        whereConditions.physician = {
          physician: {
            physician_speciality: {
              some: {
                speciality_id: filters.specialty_id,
              },
            },
          },
        };
      }

      const medicalEvents = await this.prisma.medical_event.findMany({
        where: whereConditions,
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
        include: {
          physician: {
            include: {
              physician: {
                include: {
                  physician_speciality: {
                    include: {
                      speciality: true,
                    },
                  },
                },
              },
            },
          },
        },
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
        main_diagnostic_cie_id,
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

      if (main_diagnostic_cie_id) {
        const subcategoryCodes = medicalEvent.subcategory_medical_event.map(
          (subCat) => subCat.subcategories_cie_diez.code,
        );

        if (
          subcategoryCodes.length > 0 &&
          !subcategoryCodes.includes(main_diagnostic_cie_id.toString())
        ) {
          throw new BadRequestException(
            'El diagnóstico principal debe ser una de las subcategorías CIE-10 asociadas al evento',
          );
        }
      }

      await this.prisma.$transaction(
        async (tx) => {
          await tx.medical_event.update({
            where: { id },
            data: {
              ...basicData,
              main_diagnostic_cie_id,
              updated_at: new Date(),
            },
          });

          if (vital_signs && vital_signs.length > 0) {
            await this.vitalSignsService.create({
              patient_id: medicalEvent.patient_id,
              tenant_id,
              medical_event_id: id,
              vital_signs,
            });
          }

          if (subcategory_cie_ids && subcategory_cie_ids.length > 0) {
            const currentSubcategories =
              await tx.subcategory_medical_event.findMany({
                where: { medical_eventId: id },
              });
            const currentSubcategoryIds = currentSubcategories.map(
              (sub) => sub.subCategoryId,
            );
            const subcategoryIdsToDelete = currentSubcategoryIds.filter(
              (currentId) => !subcategory_cie_ids.includes(currentId),
            );
            const subcategoryIdsToCreate = subcategory_cie_ids.filter(
              (newId) => !currentSubcategoryIds.includes(newId),
            );

            if (subcategoryIdsToDelete.length > 0) {
              await tx.subcategory_medical_event.deleteMany({
                where: {
                  medical_eventId: id,
                  subCategoryId: { in: subcategoryIdsToDelete },
                },
              });
            }
            for (const subCategoryId of subcategoryIdsToCreate) {
              await tx.subcategory_medical_event.create({
                data: { medical_eventId: id, subCategoryId },
              });
            }
          }

          if (physical_explorations && physical_explorations.length > 0) {
            const exploration = physical_explorations[0];
            await this.physicalExplorationService.createPhysicalExploration({
              patient_id: medicalEvent.patient_id,
              physician_id: userId,
              medical_event_id: id,
              tenant_id,
              description: exploration.description,
              physical_exploration_area_id:
                exploration.physical_exploration_area_id,
            });
          }

          if (physical_examinations && physical_examinations.length > 0) {
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

          if (medications && medications.length > 0) {
            await this.prescriptionService.processMedications(
              tx,
              medications,
              medicalEvent.patient_id,
              userId,
              tenant_id,
              id,
              undefined,
              true,
            );
          }

          if (consultation_ended) {
            await tx.appointment.update({
              where: { id: medicalEvent.appointment_id },
              data: {
                status: 'atendida',
                updated_at: new Date(),
              },
            });
          }
        },
        {
          maxWait: 15000,
          timeout: 30000,
        },
      );

      if (consultation_ended && medications && medications.length > 0) {
        const patientForNotification = await this.prisma.user.findUnique({
          where: { id: medicalEvent.patient_id },
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            phone: true,
            is_phone_verified: true,
          },
        });

        const physicianNameForNotification = user.name
          ? `${user.name} ${user.last_name || ''}`.trim()
          : user.email;

        let prescriptionFileUrl: string | undefined;
        try {
          const relatedMedicalOrder = await this.prisma.medical_order.findFirst(
            {
              where: {
                patient_id: medicalEvent.patient_id,
                physician_id: userId,
                medical_order_type: {
                  name: { in: ['medication', 'medication-authorization'] },
                },
              },
              orderBy: { request_date: 'desc' },
              select: { url: true },
            },
          );
          if (relatedMedicalOrder?.url) {
            prescriptionFileUrl = relatedMedicalOrder.url;
          }
        } catch (error) {
          console.error(
            'Error al buscar orden médica para URL de notificación:',
            error,
          );
        }

        if (patientForNotification) {
          await this._sendMedicationNotification(
            patientForNotification,
            medications,
            physicianNameForNotification,
            prescriptionFileUrl,
          );
        }
      }

      return { message: 'Consulta médica actualizada exitosamente' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error completo al atender consulta:', error);
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

  /**
   * Valida si un médico tiene la especialidad requerida
   * @param physicianId ID del médico (user_id)
   * @param specialtyId ID de la especialidad requerida
   * @returns Promise con resultado de validación
   */
  private async validatePhysicianSpecialty(
    physicianId: string,
    specialtyId: number,
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      // Verificar que el médico tenga la especialidad especificada
      const physicianSpecialty =
        await this.prisma.physician_speciality.findFirst({
          where: {
            physician: {
              user_id: physicianId,
              deleted: false,
            },
            speciality_id: specialtyId,
          },
          include: {
            speciality: {
              select: {
                name: true,
              },
            },
          },
        });

      if (!physicianSpecialty) {
        return {
          isValid: false,
          reason: 'El médico seleccionado no tiene la especialidad requerida',
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating physician specialty:', error);
      return {
        isValid: false,
        reason: 'Error al validar la especialidad del médico',
      };
    }
  }

  private async _sendMedicationNotification(
    patient,
    medications,
    physicianName,
    fileUrl?: string,
  ) {
    await this.notificationService.sendMedicationUpdateNotification(
      patient,
      medications,
      physicianName,
      fileUrl,
    );
  }
}
