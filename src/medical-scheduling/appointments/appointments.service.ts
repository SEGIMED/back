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
  ): Promise<{ message: string }> {
    // Verificar que las fechas de inicio y fin sean válidas
    if (!data.start || !data.end || data.start >= data.end) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    try {
      const patientExists = await this.prisma.patient.findUnique({
        where: { id: data.patient_id },
      });
      if (!patientExists) {
        throw new BadRequestException('El paciente no existe');
      }

      const physicianExists = await this.prisma.physician.findUnique({
        where: { id: data.physician_id },
      });
      if (!physicianExists) {
        throw new BadRequestException('El médico no existe');
      }

      // Verificar si hay conflicto de citas
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

      // Iniciar una transacción para asegurar la consistencia de los datos
      await this.prisma.$transaction(async (prisma) => {
        // Crear la cita
        const appointment = await prisma.appointment.create({ data });

        if (!appointment) {
          throw new InternalServerErrorException('Error al crear la cita');
        }

        // Crear el evento médico asociado directamente con Prisma
        await prisma.medical_event.create({
          data: {
            appointment_id: appointment.id,
            patient_id: data.patient_id,
            physician_id: data.physician_id,
            tenant_id: data.tenant_id,
          },
        });
      });

      return { message: 'Cita creada exitosamente' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Error al crear la cita');
      }
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
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
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
