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
import * as moment from 'moment';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // Helper method to convert HH:MM to minutes since midnight
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Method to check if the appointment is within physician's schedule
  private async isAppointmentInPhysicianSchedule(
    physicianId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<{ isAvailable: boolean; reason?: string }> {
    try {
      // Get the physician by user_id
      const physician = await this.prisma.physician.findFirst({
        where: {
          user_id: physicianId,
          tenant_id: tenantId,
          deleted: false,
        },
      });

      if (!physician) {
        return { isAvailable: false, reason: 'Médico no encontrado' };
      }

      const appointmentDate = moment(startDate).startOf('day');
      const dayOfWeek = appointmentDate.day(); // 0 = Sunday, 1 = Monday, etc.

      // Check if there's an exception for this date
      const exception =
        await this.prisma.physician_schedule_exception.findFirst({
          where: {
            physician_id: physician.id,
            date: {
              gte: appointmentDate.toDate(),
              lt: appointmentDate.clone().add(1, 'day').toDate(),
            },
            tenant_id: tenantId,
            deleted: false,
          },
        });

      // If there's an exception and the physician is not available, return false
      if (exception && !exception.is_available) {
        return {
          isAvailable: false,
          reason:
            exception.reason || 'El médico no está disponible en esta fecha',
        };
      }

      // Get the schedule for this day of the week
      const schedule = await this.prisma.physician_schedule.findFirst({
        where: {
          physician_id: physician.id,
          day_of_week: dayOfWeek,
          tenant_id: tenantId,
          deleted: false,
        },
      });

      // If there's no schedule for this day or it's marked as not a working day
      if (!schedule || !schedule.is_working_day) {
        return {
          isAvailable: false,
          reason: 'El médico no tiene horarios configurados para este día',
        };
      }

      // Check if appointment is within physician's working hours
      const startTime = moment(startDate);
      const endTime = moment(endDate);

      // Convert times to minutes for easier comparison
      const apptStartMinutes = startTime.hours() * 60 + startTime.minutes();
      const apptEndMinutes = endTime.hours() * 60 + endTime.minutes();
      const scheduleStartMinutes = this.timeToMinutes(schedule.start_time);
      const scheduleEndMinutes = this.timeToMinutes(schedule.end_time);

      // Check if appointment is within working hours
      if (
        apptStartMinutes < scheduleStartMinutes ||
        apptEndMinutes > scheduleEndMinutes
      ) {
        return {
          isAvailable: false,
          reason: 'La cita está fuera del horario de atención del médico',
        };
      }

      // Check if appointment is during rest period
      if (schedule.rest_start && schedule.rest_end) {
        const restStartMinutes = this.timeToMinutes(schedule.rest_start);
        const restEndMinutes = this.timeToMinutes(schedule.rest_end);

        // If appointment overlaps with rest period
        if (
          (apptStartMinutes >= restStartMinutes &&
            apptStartMinutes < restEndMinutes) ||
          (apptEndMinutes > restStartMinutes &&
            apptEndMinutes <= restEndMinutes) ||
          (apptStartMinutes < restStartMinutes &&
            apptEndMinutes > restEndMinutes)
        ) {
          return {
            isAvailable: false,
            reason: 'La cita coincide con el periodo de descanso del médico',
          };
        }
      }

      // Check appointment length
      const appointmentLengthMinutes = apptEndMinutes - apptStartMinutes;
      if (appointmentLengthMinutes !== schedule.appointment_length) {
        return {
          isAvailable: false,
          reason: `La duración de la cita debe ser de ${schedule.appointment_length} minutos`,
        };
      }

      // Check if there are too many simultaneous appointments
      if (schedule.simultaneous_slots > 1) {
        const existingAppointments = await this.prisma.appointment.count({
          where: {
            physician_id: physicianId,
            tenant_id: tenantId,
            deleted: false,
            status: { not: 'cancelada' },
            AND: [{ start: { lte: endDate } }, { end: { gte: startDate } }],
          },
        });

        if (existingAppointments >= schedule.simultaneous_slots) {
          return {
            isAvailable: false,
            reason:
              'El médico ya tiene el máximo de citas simultáneas para este horario',
          };
        }
      }

      return { isAvailable: true };
    } catch (error) {
      console.error('Error checking physician schedule:', error);
      return {
        isAvailable: false,
        reason: 'Error al verificar disponibilidad del médico',
      };
    }
  }

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

      // Verificar si la cita está dentro del horario del médico
      const scheduleCheck = await this.isAppointmentInPhysicianSchedule(
        data.physician_id,
        data.start,
        data.end,
        tenant,
      );

      if (!scheduleCheck.isAvailable) {
        throw new BadRequestException(
          scheduleCheck.reason || 'El horario no está disponible',
        );
      }

      // Verificar conflicto de horarios con otras citas
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
