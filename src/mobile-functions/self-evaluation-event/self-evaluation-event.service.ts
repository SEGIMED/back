import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSelfEvaluationEventDto } from './dto/create-self-evaluation-event.dto';
import { VitalSignsService } from '../../medical-scheduling/modules/vital-signs/vital-signs.service';

@Injectable()
export class SelfEvaluationEventService {
  constructor(
    private prisma: PrismaService,
    private vitalSignsService: VitalSignsService,
  ) {}

  /**
   * Crea un evento de autoevaluación con sus signos vitales asociados
   * @param createSelfEvaluationEventDto Datos para crear el evento
   */
  async create(createSelfEvaluationEventDto: CreateSelfEvaluationEventDto) {
    const { patient_id, medical_event_id, tenant_id, vital_signs } =
      createSelfEvaluationEventDto;

    try {
      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patient_id },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Verificar que el evento médico existe y pertenece al paciente
      const medicalEvent = await this.prisma.medical_event.findUnique({
        where: { id: medical_event_id },
        include: {
          patient: true,
        },
      });

      if (!medicalEvent) {
        throw new NotFoundException('Evento médico no encontrado');
      }

      if (medicalEvent.patient_id !== patient.patient.id) {
        throw new BadRequestException(
          'El paciente no coincide con el evento médico',
        );
      }

      if (medicalEvent.tenant_id !== tenant_id) {
        throw new BadRequestException(
          'El tenant no coincide con el evento médico',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const selfEvaluationEvent = await tx.self_evaluation_event.create({
          data: {
            patient_id,
            medical_event_id,
            tenant_id,
          },
        });

        // Crear los signos vitales asociados
        if (vital_signs && vital_signs.length > 0) {
          await this.vitalSignsService.create({
            patient_id,
            tenant_id,
            self_evaluation_event_id: selfEvaluationEvent.id,
            vital_signs,
          });
        }

        // Obtener el evento completo con los signos vitales
        return await tx.self_evaluation_event.findUnique({
          where: { id: selfEvaluationEvent.id },
          include: {
            vital_signs: {
              include: {
                vital_sign: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear evento de autoevaluación: ${error.message}`,
      );
    }
  }
}
