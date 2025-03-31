import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMedicalOrderDto } from './dto/create-medical_order.dto';
import { UpdateMedicalOrderDto } from './dto/update-medical_order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { EmailService } from 'src/services/email/email.service';
import { TwilioService } from 'src/services/twilio/twilio.service';
import { Multer } from 'multer';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service';
import { medicalOrderHtml } from 'src/services/email/templates/medicalOrderHtml';
import { medicationHtml } from 'src/services/email/templates/medicationHtml';

@Injectable()
export class MedicalOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    createMedicalOrderDto: CreateMedicalOrderDto,
    orderType: string,
    tenantId: string,
    physicianId: string,
    file?: Multer.File,
  ) {
    try {
      // Validar que el tipo de orden médica existe
      const orderTypeObj = await this.prisma.medical_order_type.findFirst({
        where: { name: orderType },
      });

      if (!orderTypeObj) {
        throw new BadRequestException(
          `Tipo de orden médica "${orderType}" no válido`,
        );
      }

      // Validar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: createMedicalOrderDto.patient_id },
      });

      if (!patient) {
        throw new BadRequestException('Paciente no encontrado');
      }

      // Si hay archivo, subirlo a Cloudinary
      let fileUrl = createMedicalOrderDto.url;
      if (file) {
        try {
          const result = await this.fileUploadService.uploadFile(file);
          fileUrl = result.url;
        } catch (uploadError) {
          console.error('Error al subir archivo a Cloudinary:', uploadError);
          throw new BadRequestException('Error al procesar el archivo adjunto');
        }
      }

      // Establecer los campos comunes
      const commonData = {
        medical_order_type_id: orderTypeObj.id,
        patient_id: createMedicalOrderDto.patient_id,
        tenant_id: tenantId,
        url: fileUrl,
        request_date: new Date(),
        additional_text: createMedicalOrderDto.additional_text,
        description_type: createMedicalOrderDto.description_type,
        physician_id: physicianId,
      };

      // Determinar campos específicos según el tipo de orden
      let specificData = {};

      switch (orderType) {
        case 'study-authorization':
          if (!createMedicalOrderDto.cat_study_type_id) {
            throw new BadRequestException('El tipo de estudio es requerido');
          }

          // Validar que el tipo de estudio existe
          const studyType = await this.prisma.cat_study_type.findUnique({
            where: { id: createMedicalOrderDto.cat_study_type_id },
          });

          if (!studyType) {
            throw new BadRequestException('Tipo de estudio no encontrado');
          }

          specificData = {
            cat_study_type_id: createMedicalOrderDto.cat_study_type_id,
            request_reason: createMedicalOrderDto.request_reason,
          };
          break;

        case 'certification':
          if (!createMedicalOrderDto.cat_certification_type_id) {
            throw new BadRequestException(
              'El tipo de certificado es requerido',
            );
          }

          // Si es "otros" (id = 1), crear un nuevo tipo de certificado personalizado
          if (
            createMedicalOrderDto.cat_certification_type_id === 1 &&
            createMedicalOrderDto.description_type
          ) {
            const newCertType = await this.prisma.cat_certification_type.create(
              {
                data: {
                  name: createMedicalOrderDto.description_type,
                  tenant_id: tenantId,
                  custom: true,
                },
              },
            );

            specificData = {
              cat_certification_type_id: newCertType.id,
              category_cie_diez_id: createMedicalOrderDto.category_cie_diez_id,
            };
          } else {
            // Validar que el tipo de certificado existe
            const certType =
              await this.prisma.cat_certification_type.findUnique({
                where: { id: createMedicalOrderDto.cat_certification_type_id },
              });

            if (!certType) {
              throw new BadRequestException(
                'Tipo de certificado no encontrado',
              );
            }

            specificData = {
              cat_certification_type_id:
                createMedicalOrderDto.cat_certification_type_id,
              category_cie_diez_id: createMedicalOrderDto.category_cie_diez_id,
            };
          }
          break;

        case 'hospitalization-request':
          if (!createMedicalOrderDto.hospitalization_reason) {
            throw new BadRequestException(
              'El motivo de hospitalización es requerido',
            );
          }

          specificData = {
            hospitalization_reason:
              createMedicalOrderDto.hospitalization_reason,
            category_cie_diez_id: createMedicalOrderDto.category_cie_diez_id,
            request_reason: createMedicalOrderDto.request_reason,
          };
          break;

        case 'appointment-request':
          if (!createMedicalOrderDto.cat_speciality_id) {
            throw new BadRequestException('La especialidad es requerida');
          }

          // Validar que la especialidad existe
          const speciality = await this.prisma.cat_speciality.findUnique({
            where: { id: createMedicalOrderDto.cat_speciality_id },
          });

          if (!speciality) {
            throw new BadRequestException('Especialidad no encontrada');
          }

          specificData = {
            cat_speciality_id: createMedicalOrderDto.cat_speciality_id,
            category_cie_diez_id: createMedicalOrderDto.category_cie_diez_id,
          };
          break;

        case 'medication':
        case 'medication-authorization':
          // Verificar que hay medicaciones en el DTO
          if (
            !createMedicalOrderDto.medications ||
            createMedicalOrderDto.medications.length === 0
          ) {
            throw new BadRequestException('Se deben especificar medicamentos');
          }
          break;

        default:
          throw new BadRequestException(
            `Tipo de orden médica "${orderType}" no implementado`,
          );
      }

      // Crear la orden médica combinando los datos comunes y específicos
      const newOrder = await this.prisma.medical_order.create({
        data: {
          ...commonData,
          ...specificData,
        },
      });

      // Procesar medicaciones si existe
      if (
        (orderType === 'medication' ||
          orderType === 'medication-authorization') &&
        createMedicalOrderDto.medications &&
        createMedicalOrderDto.medications.length > 0
      ) {
        await this._processMedications(
          createMedicalOrderDto.medications,
          createMedicalOrderDto.patient_id,
          physicianId,
          newOrder.id,
          tenantId,
          null, // No hay medical_event_id en este caso
          orderType === 'medication', // true si es prescripción, false si es autorización
        );
      }

      // Obtener el médico para el correo
      const physician = await this.prisma.user.findUnique({
        where: { id: physicianId },
      });

      // Enviar notificaciones por correo y WhatsApp
      await this._sendNotifications(
        patient,
        newOrder,
        orderType,
        physician?.name,
        createMedicalOrderDto.medications,
      );

      return {
        message: 'Se ha creado correctamente la orden médica',
        order_id: newOrder.id,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating medical order:', error);
      throw new InternalServerErrorException(
        `No se ha podido generar la orden médica: ${error.message}`,
      );
    }
  }

  async findAll(
    paginationParams: PaginationParams,
    tenantId: string,
    orderType?: string,
    patientId?: string,
  ) {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(paginationParams);

      const whereClause: any = { tenant_id: tenantId };

      // Filtrar por tipo de orden si se proporciona
      if (orderType) {
        const typeObj = await this.prisma.medical_order_type.findFirst({
          where: { name: orderType },
        });

        if (typeObj) {
          whereClause.medical_order_type_id = typeObj.id;
        }
      }

      // Filtrar por paciente si se proporciona
      if (patientId) {
        whereClause.patient_id = patientId;
      }

      const orders = await this.prisma.medical_order.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
        include: {
          patient: {
            select: {
              name: true,
              last_name: true,
              email: true,
              phone: true,
            },
          },
          medical_order_type: true,
          cat_study_type: true,
          cat_certification_type: true,
          cat_speciality: true,
          category_cie_diez: true,
        },
      });

      return orders;
    } catch (error) {
      console.error('Error fetching medical orders:', error);
      throw new InternalServerErrorException(
        `No se ha podido consultar las ordenes médicas: ${error.message}`,
      );
    }
  }

  async findOne(id: string, tenantId: string) {
    try {
      const medicalOrder = await this.prisma.medical_order.findFirst({
        where: {
          id: id,
          tenant_id: tenantId,
        },
        include: {
          patient: {
            select: {
              name: true,
              last_name: true,
              email: true,
              phone: true,
            },
          },
          medical_order_type: true,
          cat_study_type: true,
          cat_certification_type: true,
          cat_speciality: true,
          category_cie_diez: true,
        },
      });

      if (!medicalOrder) {
        throw new NotFoundException(
          'No se ha podido encontrar la orden médica',
        );
      }

      return medicalOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `No se ha podido consultar la orden médica: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateMedicalOrderDto: UpdateMedicalOrderDto,
    tenantId: string,
  ) {
    try {
      // Verificar si la orden existe
      const existingOrder = await this.prisma.medical_order.findFirst({
        where: {
          id: id,
          tenant_id: tenantId,
        },
      });

      if (!existingOrder) {
        throw new NotFoundException(
          'No se ha podido encontrar la orden médica',
        );
      }

      await this.prisma.medical_order.update({
        where: { id: id },
        data: { ...updateMedicalOrderDto },
      });

      return { message: 'Se ha actualizado correctamente la orden' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `No se ha podido actualizar la orden médica: ${error.message}`,
      );
    }
  }

  async remove(id: string, tenantId: string) {
    try {
      // Verificar si la orden existe
      const existingOrder = await this.prisma.medical_order.findFirst({
        where: {
          id: id,
          tenant_id: tenantId,
        },
      });

      if (!existingOrder) {
        throw new NotFoundException(
          'No se ha podido encontrar la orden médica',
        );
      }

      await this.prisma.medical_order.delete({
        where: { id: id },
      });

      return { message: 'Se ha eliminado correctamente la orden médica' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `No se ha podido eliminar la orden médica: ${error.message}`,
      );
    }
  }

  private async _sendNotifications(
    patient,
    order,
    orderType: string,
    physicianName: string,
    medications?: any[],
  ) {
    try {
      // Determinar qué plantilla usar según el tipo de orden
      let emailContent: string;
      let emailSubject: string;

      if (
        orderType === 'medication' ||
        orderType === 'medication-authorization'
      ) {
        emailContent = medicationHtml(
          patient.name,
          patient.last_name || '',
          medications,
          physicianName,
        );
        emailSubject = `Nuevas medicaciones prescritas`;
      } else {
        emailContent = medicalOrderHtml(
          patient.name,
          patient.last_name || '',
          orderType,
          new Date(order.request_date).toLocaleDateString(),
          physicianName,
          order.description_type,
          order.url,
        );
        emailSubject = `Nueva orden médica: ${orderType}`;
      }

      // Preparar adjuntos si hay una URL del documento
      let attachments = [];
      if (order.url) {
        try {
          const attachment = await this.emailService.getAttachmentFromUrl(
            order.url,
          );
          attachments = [attachment];
        } catch (attachmentError) {
          console.error(
            'Error al preparar el archivo adjunto:',
            attachmentError,
          );
          // Continuar sin adjunto si hay error
        }
      }

      // Enviar email
      if (patient.email) {
        try {
          await this.emailService.sendMail(
            patient.email,
            emailSubject,
            emailContent,
            attachments.length > 0 ? attachments : undefined,
          );
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // No lanzar error, seguir con el flujo
        }
      }

      // Enviar WhatsApp si está disponible
      if (patient.phone && patient.is_phone_verified) {
        try {
          let whatsappMessage: string;

          if (
            orderType === 'medication' ||
            orderType === 'medication-authorization'
          ) {
            const medicationListText = medications
              .map(
                (med) =>
                  `• ${med.monodrug}: ${med.dose} ${med.dose_units}, ${med.frecuency}, por ${med.duration} ${med.duration_units}` +
                  (med.observations
                    ? `\n  _Observaciones: ${med.observations}_`
                    : ''),
              )
              .join('\n');

            whatsappMessage = `Hola ${patient.name},

Durante su consulta, el Dr./Dra. ${physicianName || 'su médico'} ha prescrito las siguientes medicaciones:

${medicationListText}

Por favor, siga las indicaciones de su médico y tome sus medicamentos según lo prescrito.

SEGIMED - Sistema de Gestión Médica`;
          } else {
            whatsappMessage = `Hola ${patient.name},
Se ha generado una nueva orden médica de tipo *${orderType}* para usted.

*Detalles de la orden:*
• Fecha: ${new Date(order.request_date).toLocaleDateString()}
• Médico: ${physicianName || 'No especificado'}
${order.description_type ? `• Descripción: ${order.description_type}` : ''}

Si tiene alguna pregunta, contacte a su médico.

SEGIMED - Sistema de Gestión Médica`;
          }

          // Si hay URL del documento, enviar con archivo adjunto
          if (order.url) {
            await this.twilioService.sendWhatsAppWithMedia(
              patient.phone,
              whatsappMessage,
              order.url,
            );
          } else {
            await this.twilioService.sendOtp(patient.phone, whatsappMessage);
          }
        } catch (whatsappError) {
          console.error('Error sending WhatsApp notification:', whatsappError);
          // No lanzar error, seguir con el flujo
        }
      }
    } catch (error) {
      console.error('Error en notificaciones:', error);
      // Continuamos con el flujo normal aunque fallen las notificaciones
    }
  }

  /**
   * Procesa las medicaciones para una orden médica o consulta
   * @param medications Lista de medicaciones a procesar
   * @param patientId ID del paciente
   * @param physicianId ID del médico
   * @param orderId ID de la orden médica (opcional)
   * @param tenantId ID del tenant
   * @param medicalEventId ID del evento médico (opcional)
   * @param isAuthorized Indica si la medicación está autorizada
   */
  private async _processMedications(
    medications: any[],
    patientId: string,
    physicianId: string,
    orderId: string,
    tenantId: string,
    medicalEventId: string | null,
    isAuthorized: boolean = true,
  ) {
    for (const medication of medications) {
      // Verificar si ya existe una prescripción activa para este medicamento
      const existingPrescription = await this.prisma.prescription.findFirst({
        where: {
          patient_id: patientId,
          monodrug: medication.monodrug,
          active: true,
        },
      });

      if (existingPrescription) {
        // Si ya existe una prescripción activa, crear una nueva entrada en el historial
        await this.prisma.pres_mod_history.create({
          data: {
            prescription_id: existingPrescription.id,
            physician_id: physicianId,
            medical_order_id: orderId,
            medical_event_id: medicalEventId,
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
        const newPrescription = await this.prisma.prescription.create({
          data: {
            patient_id: patientId,
            monodrug: medication.monodrug,
            active: true,
            authorized: isAuthorized,
            tenant_id: tenantId,
          },
        });

        // Crear la primera entrada en el historial
        await this.prisma.pres_mod_history.create({
          data: {
            prescription_id: newPrescription.id,
            physician_id: physicianId,
            medical_order_id: orderId,
            medical_event_id: medicalEventId,
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
  }
}
