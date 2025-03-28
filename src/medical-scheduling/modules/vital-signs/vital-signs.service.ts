import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVitalSignDto, VitalSignDto } from './dto/create-vital-sign.dto';
import { FindVitalSignsByPatientDto } from './dto/find-vital-signs.dto';

@Injectable()
export class VitalSignsService {
  constructor(private prisma: PrismaService) {}

  async create(createVitalSignDto: CreateVitalSignDto) {
    const {
      patient_id,
      tenant_id,
      medical_event_id,
      self_evaluation_event_id,
      vital_signs,
    } = createVitalSignDto;

    // Validar que se proporciona solo un tipo de evento (medical_event o self_evaluation_event)
    if (medical_event_id && self_evaluation_event_id) {
      throw new BadRequestException(
        'No puede proporcionar ID de evento médico y de autoevaluación simultáneamente',
      );
    }

    if (!medical_event_id && !self_evaluation_event_id) {
      throw new BadRequestException(
        'Debe proporcionar un ID de evento médico o de autoevaluación',
      );
    }

    try {
      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patient_id },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Si es un evento médico, verificar que el paciente y el tenant coincidan
      if (medical_event_id) {
        const medicalEvent = await this.prisma.medical_event.findUnique({
          where: { id: medical_event_id },
          include: {
            patient: true,
            physician: true,
          },
        });

        if (!medicalEvent) {
          throw new NotFoundException('Evento médico no encontrado');
        }

        // Verificar que el paciente del evento médico coincide con el paciente proporcionado
        if (medicalEvent.patient_id !== patient.patient.id) {
          throw new BadRequestException(
            'El paciente no coincide con el evento médico',
          );
        }

        // Verificar que el tenant del evento médico coincide con el tenant proporcionado
        if (medicalEvent.tenant_id !== tenant_id) {
          throw new BadRequestException(
            'El tenant no coincide con el evento médico',
          );
        }
      }

      // Si es un evento de autoevaluación, verificar que el paciente y el tenant coincidan
      if (self_evaluation_event_id) {
        const selfEvaluationEvent =
          await this.prisma.self_evaluation_event.findUnique({
            where: { id: self_evaluation_event_id },
          });

        if (!selfEvaluationEvent) {
          throw new NotFoundException('Evento de autoevaluación no encontrado');
        }

        // Verificar que el paciente del evento de autoevaluación coincide con el paciente proporcionado
        if (selfEvaluationEvent.patient_id !== patient_id) {
          throw new BadRequestException(
            'El paciente no coincide con el evento de autoevaluación',
          );
        }

        // Verificar que el tenant del evento de autoevaluación coincide con el tenant proporcionado
        if (selfEvaluationEvent.tenant_id !== tenant_id) {
          throw new BadRequestException(
            'El tenant no coincide con el evento de autoevaluación',
          );
        }
      }

      // Obtener los signos vitales existentes para este evento
      const existingVitalSigns = await this.prisma.vital_signs.findMany({
        where: {
          ...(medical_event_id && { medical_event_id }),
          ...(self_evaluation_event_id && { self_evaluation_event_id }),
          deleted: false,
        },
      });

      // Identificar qué signos vitales deben crearse, actualizarse o eliminarse
      const vitalSignsToCreate: VitalSignDto[] = [];
      const vitalSignsToUpdate: { id: string; measure: number }[] = [];
      const vitalSignsToDelete: string[] = [];

      // ID de signos vitales proporcionados en la solicitud
      const providedVitalSignIds = vital_signs.map((vs) => vs.vital_sign_id);

      // Marcar signos vitales para actualización o eliminación
      for (const existingVS of existingVitalSigns) {
        const matchingVS = vital_signs.find(
          (vs) => vs.vital_sign_id === existingVS.vital_sign_id,
        );

        if (matchingVS) {
          // Si la medida ha cambiado, actualizar
          if (matchingVS.measure !== existingVS.measure) {
            vitalSignsToUpdate.push({
              id: existingVS.id,
              measure: matchingVS.measure,
            });
          }
        } else {
          // Si el signo vital ya no está en la solicitud, eliminarlo (soft delete)
          vitalSignsToDelete.push(existingVS.id);
        }
      }

      // Identificar signos vitales nuevos
      for (const vs of vital_signs) {
        const exists = existingVitalSigns.some(
          (existingVS) => existingVS.vital_sign_id === vs.vital_sign_id,
        );

        if (!exists) {
          vitalSignsToCreate.push(vs);
        }
      }

      // Verificar que no hay signos vitales duplicados
      const uniqueVitalSignIds = new Set(providedVitalSignIds);
      if (uniqueVitalSignIds.size !== providedVitalSignIds.length) {
        throw new BadRequestException(
          'No se permiten signos vitales duplicados para un mismo evento',
        );
      }

      // Ejecutar las operaciones en una transacción
      return this.prisma.$transaction(async (tx) => {
        // Crear nuevos signos vitales
        const createdVitalSigns = [];
        for (const vs of vitalSignsToCreate) {
          const newVitalSign = await tx.vital_signs.create({
            data: {
              patient_id,
              tenant_id,
              ...(medical_event_id && { medical_event_id }),
              ...(self_evaluation_event_id && { self_evaluation_event_id }),
              vital_sign_id: vs.vital_sign_id,
              measure: vs.measure,
            },
          });
          createdVitalSigns.push(newVitalSign);
        }

        // Actualizar signos vitales existentes
        const updatedVitalSigns = [];
        for (const vs of vitalSignsToUpdate) {
          const updatedVitalSign = await tx.vital_signs.update({
            where: { id: vs.id },
            data: { measure: vs.measure, updated_at: new Date() },
          });
          updatedVitalSigns.push(updatedVitalSign);
        }

        // Eliminar signos vitales que ya no se necesitan (soft delete)
        const deletedVitalSigns = [];
        for (const id of vitalSignsToDelete) {
          const deletedVitalSign = await tx.vital_signs.update({
            where: { id },
            data: { deleted: true, deleted_at: new Date() },
          });
          deletedVitalSigns.push(deletedVitalSign);
        }

        // Obtener todos los signos vitales actualizados
        const allVitalSigns = await tx.vital_signs.findMany({
          where: {
            ...(medical_event_id && { medical_event_id }),
            ...(self_evaluation_event_id && { self_evaluation_event_id }),
            deleted: false,
          },
          include: {
            vital_sign: true,
          },
        });

        return {
          created: createdVitalSigns.length,
          updated: updatedVitalSigns.length,
          deleted: deletedVitalSigns.length,
          vital_signs: allVitalSigns,
        };
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear/actualizar signos vitales: ${error.message}`,
      );
    }
  }

  /**
   * Encuentra todos los signos vitales agrupados por evento
   * @param findVitalSignsDto Datos para buscar los signos vitales
   */
  async findAllByPatient(findVitalSignsDto: FindVitalSignsByPatientDto) {
    try {
      const { patient_id, tenant_id } = findVitalSignsDto;

      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patient_id },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Obtener todos los eventos médicos del paciente
      const medicalEvents = await this.prisma.medical_event.findMany({
        where: {
          patient_id: patient.patient.id,
          tenant_id,
          deleted: false,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          physician: {
            select: {
              id: true,
              name: true,
              last_name: true,
            },
          },
          vital_signs: {
            where: { deleted: false },
            include: {
              vital_sign: true,
            },
          },
        },
      });

      // Obtener todos los eventos de autoevaluación del paciente
      const selfEvaluationEvents =
        await this.prisma.self_evaluation_event.findMany({
          where: {
            patient_id,
            tenant_id,
          },
          select: {
            id: true,
            created_at: true,
            updated_at: true,
            vital_signs: {
              where: { deleted: false },
              include: {
                vital_sign: true,
              },
            },
          },
        });

      return {
        medical_events: medicalEvents,
        self_evaluation_events: selfEvaluationEvents,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener signos vitales: ${error.message}`,
      );
    }
  }

  /**
   * Elimina un signo vital (soft delete)
   * Solo puede ser eliminado por el médico relacionado con el evento o un superadmin
   * @param id ID del signo vital
   * @param userId ID del usuario que realiza la eliminación
   * @param tenantId ID del tenant
   */
  async remove(id: string, userId: string, tenantId: string) {
    try {
      // Obtener el signo vital
      const vitalSign = await this.prisma.vital_signs.findUnique({
        where: { id },
        include: {
          medical_event: {
            include: {
              physician: true,
            },
          },
        },
      });

      if (!vitalSign) {
        throw new NotFoundException('Signo vital no encontrado');
      }

      // Verificar que el tenant coincide
      if (vitalSign.tenant_id !== tenantId) {
        throw new ForbiddenException(
          'No tiene permisos para eliminar este signo vital',
        );
      }

      // Verificar que el usuario es el médico relacionado con el evento médico o un superadmin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const isSuperAdmin = user.is_superadmin;
      const isPhysician =
        vitalSign.medical_event &&
        vitalSign.medical_event.physician &&
        vitalSign.medical_event.physician.id === userId;

      if (!isSuperAdmin && !isPhysician) {
        throw new ForbiddenException(
          'No tiene permisos para eliminar este signo vital',
        );
      }

      // Eliminar el signo vital (soft delete)
      return this.prisma.vital_signs.update({
        where: { id },
        data: {
          deleted: true,
          deleted_at: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar signo vital: ${error.message}`,
      );
    }
  }
}
