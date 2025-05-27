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
import { FileUploadService } from 'src/utils/file_upload/file_upload.service';
import { medicalOrderHtml } from 'src/services/email/templates/medicalOrderHtml';
import { medicationHtml } from 'src/services/email/templates/medicationHtml';
import {
  MedicalOrderPaginatedResponseDto,
  MedicalOrderPhysicianResponseDto,
  MedicalOrderPatientResponseDto,
} from './dto/medical-order-response.dto';
import { PrescriptionService } from 'src/medical-scheduling/modules/prescription/prescription.service';

@Injectable()
export class MedicalOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
    private readonly fileUploadService: FileUploadService,
    private readonly prescriptionService: PrescriptionService,
  ) {}

  async create(
    createMedicalOrderDto: CreateMedicalOrderDto,
    orderType: string,
    tenantId: string,
    physicianId: string,
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

      // Si hay archivo en base64, subirlo a Cloudinary
      let fileUrl = createMedicalOrderDto.url;
      if (createMedicalOrderDto.file) {
        try {
          const uploadResult = await this.fileUploadService.uploadBase64File(
            createMedicalOrderDto.file,
            `medical-order-${orderType}-${createMedicalOrderDto.patient_id}-${Date.now()}`,
          );
          fileUrl = uploadResult.url;
          // Eliminar la propiedad file para evitar errores con Prisma
          delete createMedicalOrderDto.file;
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

      switch (orderTypeObj.name) {
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
            `Tipo de orden médica "${orderTypeObj.description}" no implementado`,
          );
      }

      // Crear la orden médica combinando los datos comunes y específicos
      const newOrder = await this.prisma.$transaction(async (tx) => {
        const order = await tx.medical_order.create({
          data: {
            ...commonData,
            ...specificData,
          },
        });

        // Procesar medicaciones si existe
        if (
          (orderTypeObj.name === 'medication' ||
            orderTypeObj.name === 'medication-authorization') &&
          createMedicalOrderDto.medications &&
          createMedicalOrderDto.medications.length > 0
        ) {
          await this.prescriptionService.processMedications(
            tx,
            createMedicalOrderDto.medications,
            createMedicalOrderDto.patient_id,
            physicianId,
            tenantId,
            undefined, // No hay medical_event_id en este caso
            order.id,
            orderTypeObj.name === 'medication', // true si es prescripción, false si es autorización
          );
        }

        return order;
      });

      // Obtener el médico para el correo
      const physician = await this.prisma.user.findUnique({
        where: { id: physicianId },
      });

      // Enviar notificaciones por correo y WhatsApp
      await this._sendNotifications(
        patient,
        newOrder,
        orderTypeObj,
        physician?.last_name,
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

      // Si hay archivo en base64, subirlo a Cloudinary
      if (updateMedicalOrderDto.file) {
        try {
          const orderType = await this.prisma.medical_order_type.findUnique({
            where: { id: existingOrder.medical_order_type_id },
          });

          const uploadResult = await this.fileUploadService.uploadBase64File(
            updateMedicalOrderDto.file,
            `medical-order-${orderType?.name || 'update'}-${existingOrder.patient_id}-${Date.now()}`,
          );
          updateMedicalOrderDto.url = uploadResult.url;
          // Eliminar la propiedad file para evitar errores con Prisma
          delete updateMedicalOrderDto.file;
        } catch (uploadError) {
          console.error('Error al subir archivo a Cloudinary:', uploadError);
          throw new BadRequestException('Error al procesar el archivo adjunto');
        }
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
    orderType: { description: string; name: string },
    physicianName: string,
    medications?: any[],
  ) {
    try {
      // Determinar qué plantilla usar según el tipo de orden
      let emailContent: string;
      let emailSubject: string;

      if (
        orderType.name === 'medication' ||
        orderType.name === 'medication-authorization'
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
          orderType.description,
          new Date(order.request_date).toLocaleDateString(),
          physicianName,
          order.description_type,
          order.url,
        );
        emailSubject = `Nueva orden médica: ${orderType.description}`;
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
            orderType.name === 'medication' ||
            orderType.name === 'medication-authorization'
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

  async findAllForPhysician(
    paginationParams: PaginationParams,
    tenantId: string,
    physicianId: string,
    patientId?: string,
    orderType?: string,
  ): Promise<MedicalOrderPaginatedResponseDto> {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(paginationParams);

      // Default page size to 10 if not specified
      const limit = take || 10;
      const page = Math.floor(skip / limit) + 1 || 1;

      // Build the where clause for filtering
      const whereClause: any = {
        tenant_id: tenantId,
        physician_id: physicianId,
      };

      // Filter by order type if provided
      if (orderType) {
        const typeObj = await this.prisma.medical_order_type.findFirst({
          where: { name: orderType },
        });

        if (typeObj) {
          whereClause.medical_order_type_id = typeObj.id;
        }
      }

      // Filter by patient if provided
      if (patientId) {
        whereClause.patient_id = patientId;
      }

      // Get total count for pagination
      const totalCount = await this.prisma.medical_order.count({
        where: whereClause,
      });

      const totalPages = Math.ceil(totalCount / limit);

      // Get the actual orders
      const orders = await this.prisma.medical_order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: {
          patient: true,
          physician: true,
          medical_order_type: true,
          tenant: true,
        },
      });

      // Format the response according to the required structure
      const formattedOrders = await Promise.all(
        orders.map(async (order) => {
          // Get organization name from tenant
          let organizationName = 'N/A';
          if (order.tenant_id) {
            const org = await this.prisma.organization.findFirst({
              where: { tenant_id: order.tenant_id },
              select: { name: true },
            });
            if (org) {
              organizationName = org.name;
            }
          }

          // Get physician info
          let physicianName = 'N/A';
          if (order.physician_id) {
            const physician = await this.prisma.user.findUnique({
              where: { id: order.physician_id },
              select: { name: true, last_name: true },
            });
            if (physician) {
              physicianName = `${physician.name || ''} ${physician.last_name || ''}`;
            }
          }

          // Get patient info
          let patientName = 'N/A';
          if (order.patient_id) {
            const patient = await this.prisma.user.findUnique({
              where: { id: order.patient_id },
              select: { name: true, last_name: true },
            });
            if (patient) {
              patientName = `${patient.name || ''} ${patient.last_name || ''}`;
            }
          }

          // Get order type name
          let orderTypeName = '';
          if (order.medical_order_type_id) {
            const type = await this.prisma.medical_order_type.findUnique({
              where: { id: order.medical_order_type_id },
              select: { name: true },
            });
            if (type) {
              orderTypeName = type.name;
            }
          }

          return {
            id: order.id,
            url: order.url || '',
            request_date: order.request_date,
            organization_name: organizationName,
            physician_name: physicianName,
            patient_name: patientName,
            order_type: orderTypeName,
          } as MedicalOrderPhysicianResponseDto;
        }),
      );

      return {
        data: formattedOrders,
        total: totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching medical orders for physician:', error);
      throw new InternalServerErrorException(
        `No se ha podido consultar las ordenes médicas: ${error.message}`,
      );
    }
  }

  async findAllForPatient(
    paginationParams: PaginationParams,
    patientId: string,
    physicianId?: string,
    orderType?: string,
    specificTenantId?: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<MedicalOrderPaginatedResponseDto> {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(paginationParams);

      // Default page size to 10 if not specified
      const limit = take || 10;
      const page = Math.floor(skip / limit) + 1 || 1;

      // Get tenant IDs from JWT or query them if not provided
      let tenantIds: string[] = [];

      const patient = await this.prisma.user.findUnique({
        where: { id: patientId },
        include: {
          patient: true,
        },
      });
      console.log(patient);
      if (userTenants && userTenants.length > 0) {
        tenantIds = userTenants.map((tenant) => tenant.id);
      } else {
        // Fallback to querying the database (old method)
        const patientTenants = await this.prisma.patient_tenant.findMany({
          where: {
            patient_id: patient.patient.id,
            deleted: false,
          },
          select: {
            tenant_id: true,
          },
        });
        console.log(patientTenants);
        tenantIds = patientTenants.map((pt) => pt.tenant_id);
      }

      if (tenantIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      // Build the where clause for filtering
      const whereClause: any = {
        patient_id: patient.id,
      };

      // Use specific tenant if provided, otherwise use all tenants
      if (specificTenantId) {
        // Verify that the specified tenant is in the patient's list
        if (tenantIds.includes(specificTenantId)) {
          whereClause.tenant_id = specificTenantId;
        } else {
          // If not in the patient's list, return empty result
          return {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
      } else {
        // Use all patient's tenants
        whereClause.tenant_id = { in: tenantIds };
      }

      // Filter by physician if provided
      if (physicianId) {
        whereClause.physician_id = physicianId;
      }

      // Filter by order type if provided
      if (orderType) {
        const typeObj = await this.prisma.medical_order_type.findFirst({
          where: { name: orderType },
        });

        if (typeObj) {
          whereClause.medical_order_type_id = typeObj.id;
        }
      }

      // Get total count for pagination
      const totalCount = await this.prisma.medical_order.count({
        where: whereClause,
      });

      const totalPages = Math.ceil(totalCount / limit);
      console.log(whereClause);
      // Get the actual orders
      const orders = await this.prisma.medical_order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
      });

      // Format the response according to the required structure
      const formattedOrders = await Promise.all(
        orders.map(async (order) => {
          // Get organization name from tenant
          let organizationName = 'N/A';

          // Try to find the tenant info in the JWT first for performance
          if (userTenants && order.tenant_id) {
            const matchingTenant = userTenants.find(
              (t) => t.id === order.tenant_id,
            );
            if (matchingTenant) {
              organizationName = matchingTenant.name;
            }
          }

          // If not found in JWT, query the database
          if (organizationName === 'N/A' && order.tenant_id) {
            const org = await this.prisma.organization.findFirst({
              where: { tenant_id: order.tenant_id },
              select: { name: true },
            });
            if (org) {
              organizationName = org.name;
            }
          }

          // Get physician info
          let physicianName = 'N/A';
          if (order.physician_id) {
            const physician = await this.prisma.user.findUnique({
              where: { id: order.physician_id },
              select: { name: true, last_name: true },
            });
            if (physician) {
              physicianName = `${physician.name || ''} ${physician.last_name || ''}`;
            }
          }

          // Get order type name
          let orderTypeName = '';
          if (order.medical_order_type_id) {
            const type = await this.prisma.medical_order_type.findUnique({
              where: { id: order.medical_order_type_id },
              select: { name: true },
            });
            if (type) {
              orderTypeName = type.name;
            }
          }

          return {
            id: order.id,
            url: order.url || '',
            request_date: order.request_date,
            organization_name: organizationName,
            physician_name: physicianName,
            order_type: orderTypeName,
            tenant_id: order.tenant_id, // Add tenant_id to help frontend display organization info
          } as MedicalOrderPatientResponseDto;
        }),
      );

      return {
        data: formattedOrders,
        total: totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching medical orders for patient:', error);
      throw new InternalServerErrorException(
        `No se ha podido consultar las ordenes médicas: ${error.message}`,
      );
    }
  }
}
