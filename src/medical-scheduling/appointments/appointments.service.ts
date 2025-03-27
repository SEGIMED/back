import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { appointment, status_type } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(
    data: CreateAppointmentDto,
    tenant: string,
  ): Promise<{ message: string }> {
    // Validaciones iniciales (fechas, paciente, médico, etc.)
    if (!data.start || !data.end || data.start >= data.end) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    try {
      // Verificar existencia de entidades relacionadas
      const [patientExists, physicianExists, tenantExists] = await Promise.all([
        this.prisma.patient.findUnique({ where: { user_id: data.patient_id } }),
        this.prisma.physician.findUnique({
          where: { user_id: data.physician_id },
        }),
        this.prisma.tenant.findUnique({ where: { id: tenant } }),
      ]);

      if (!patientExists)
        throw new BadRequestException('El paciente no existe');
      if (!physicianExists)
        throw new BadRequestException('El médico no existe');
      if (!tenantExists) throw new BadRequestException('El tenant no existe');

      // Verificar conflicto de horarios
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          physician_id: data.physician_id,
          AND: [
            { start: { lte: data.end } },
            { end: { gte: data.start } },
            { status: { not: 'cancelada' } },
          ],
        },
      });

      if (conflict) {
        throw new BadRequestException(
          'El médico ya tiene una cita en ese horario',
        );
      }

      // Transacción optimizada
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Crear cita médica
        const appointment = await prisma.appointment.create({
          data: {
            consultation_reason: data.consultation_reason,
            start: data.start,
            end: data.end,
            comments: data.comments,
            status: data.status || 'pendiente',
            tenant_id: tenant, // Usar tenant_id directamente
            patient_id: data.patient_id, // Usar patient_id directamente
            physician_id: data.physician_id, // Usar physician_id directamente
          },
        });

        // 2. Crear evento médico

        await prisma.medical_event.create({
          data: {
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            physician_id: appointment.physician_id,
            tenant_id: appointment.tenant_id,
          },
        });

        return { message: 'Cita creada exitosamente' };
      });

      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByUser(
    userId: string,
    params: { status?: status_type } & PaginationParams,
  ): Promise<appointment[]> {
    // Desestructurar los parámetros de paginación y ordenación
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(params);

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          OR: [{ patient_id: userId }, { physician_id: userId }],
          ...(params.status && { status: params.status }),
        },
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      });

      return appointments;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las citas: ${error.message}`,
      );
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: status_type,
    reason?: string,
    tenant?: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id, tenant_id: tenant },
    });

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    if (status === 'cancelada' && !reason) {
      throw new Error('Se requiere una razón para cancelar la cita');
    }
    if (
      (appointment.status === 'pendiente' &&
        !['atendida', 'cancelada'].includes(status)) ||
      (appointment.status === 'atendida' && status !== 'cancelada') ||
      appointment.status === 'cancelada'
    ) {
      throw new Error(
        `Transición no permitida desde el estado ${appointment.status} a ${status}`,
      );
    }

    try {
      await this.prisma.appointment.update({
        where: { id },
        data: { status, cancelation_reason: reason || null },
      });

      return { message: `Estado de la cita actualizado a "${status}"` };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('Cita no encontrada');
      }
      throw new Error(`Error al actualizar la cita: ${error.message}`);
    }
  }
}
