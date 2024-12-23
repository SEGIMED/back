import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { status_type, Appointment } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(data: CreateAppointmentDto) {
    if (!data.start || !data.end || data.start >= data.end) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        physician_id: data.physician_id,
        AND: [{ start: { lte: data.end } }, { end: { gte: data.start } }],
      },
    });

    if (conflict) {
      throw new Error('El médico ya tiene una cita en ese horario');
    }

    // Iniciar una transacción para asegurar la consistencia de los datos
    return await this.prisma.$transaction(async (prisma) => {
      // Crear la cita
      const appointment = await prisma.appointment.create({
        data,
      });

      // Crear el evento médico asociado a la cita
      await prisma.medicalEvent.create({
        data: {
          appointment_id: appointment.id, // Relacionar con la cita
          patient_id: data.patient_id, // ID del paciente
          physician_id: data.physician_id, // ID del médico
          physician_comments: '', // Comentarios del médico (vacío o valor predeterminado)
          main_diagnostic_cie: '', // Diagnóstico principal (vacío o valor predeterminado)
          evolution: '', // Evolución (vacío o valor predeterminado)
          procedure: '', // Procedimiento (vacío o valor predeterminado)
          treatment: '', // Tratamiento (vacío o valor predeterminado)
          tenant_id: data.tenant_id, // ID del tenant
        },
      });

      // Retornar la cita creada
      return appointment;
    });
  }

  async getAppointmentsByUser(
    userId: string,
    params: { status?: status_type } & PaginationParams,
  ): Promise<any> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(params);

    const [appointments, totalAppointments] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          patient_id: userId,
          ...(params.status && { status: params.status }),
        },
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      }),
      this.prisma.appointment.count({
        where: {
          patient_id: userId,
          ...(params.status && { status: params.status }),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalAppointments / take);

    return {
      data: appointments,
      meta: {
        page: params.page || 1,
        pageSize: take,
        totalPages,
        totalItems: totalAppointments,
      },
    };
  }

  async updateAppointmentStatus(
    id: string,
    status: status_type,
    reason?: string,
  ): Promise<Appointment> {
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
      return await this.prisma.appointment.update({
        where: { id },
        data: { status, cancelation_reason: reason || null },
      });
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
