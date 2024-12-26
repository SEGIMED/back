import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, status_type } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { MedicalEventsService } from '../medical-events/medical-events.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private medicalEventsService: MedicalEventsService,
  ) {}

  async createAppointment(
    data: CreateAppointmentDto,
  ): Promise<{ message: string }> {
    if (!data.start || !data.end || data.start >= data.end) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    try {
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          physician_id: data.physician_id,
          AND: [
            { start: { lte: data.end } },
            { end: { gte: data.start } },
            { status: { not: 'Cancelada' } },
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
        // Crear el evento médico asociado a la cita utilizando el servicio MedicalEventsService
        const medicalEventMessage =
          await this.medicalEventsService.createMedicalEvent({
            appointment_id: appointment.id,
            patient_id: data.patient_id,
            physician_id: data.physician_id,
            physician_comments: '',
            main_diagnostic_cie: '',
            evolution: '',
            procedure: '',
            treatment: '',
            tenant_id: data.tenant_id,
          });

        return medicalEventMessage;
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
  ): Promise<Appointment[]> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(params);

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          patient_id: userId,
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
    if (status === 'Cancelada' && !reason) {
      throw new Error('Se requiere una razón para cancelar la cita');
    }
    if (
      (appointment.status === 'Pendiente' &&
        !['Atendida', 'Cancelada'].includes(status)) ||
      (appointment.status === 'Atendida' && status !== 'Cancelada') ||
      appointment.status === 'Cancelada'
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
