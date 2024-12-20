import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { status_type } from '@prisma/client';
import { Appointment } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private validatePagination(page: number, pageSize: number) {
    if (!Number.isInteger(page) || page <= 0) {
      throw new BadRequestException(
        'El parámetro "page" debe ser un número entero mayor que 0',
      );
    }

    if (!Number.isInteger(pageSize) || pageSize <= 0) {
      throw new BadRequestException(
        'El parámetro "pageSize" debe ser un número entero mayor que 0',
      );
    }

    return { page, pageSize };
  }

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
    filters?: { status?: status_type; page?: number; pageSize?: number },
  ): Promise<any> {
    // Validamos los parámetros de paginado (si no se pasan, se asignan valores por defecto)
    const page = filters?.page ?? 1; // Página actual, por defecto 1
    const pageSize = filters?.pageSize ?? 10; // Tamaño de la página, por defecto 10

    // Llamamos a la función de validación
    const { page: validatedPage, pageSize: validatedPageSize } =
      this.validatePagination(page, pageSize);

    const skip = (validatedPage - 1) * validatedPageSize; // Desplazamiento calculado
    const take = validatedPageSize; // Limitar la cantidad de registros que se van a devolver

    try {
      const [appointments, totalAppointments] = await Promise.all([
        this.prisma.appointment.findMany({
          where: {
            patient_id: userId,
            ...(filters?.status && { status: filters.status }),
          },
          skip, // Desplazamiento
          take, // Limitar la cantidad
          orderBy: { start: 'asc' }, // Ordenar por fecha de inicio
        }),
        this.prisma.appointment.count({
          where: {
            patient_id: userId,
            ...(filters?.status && { status: filters.status }),
          },
        }), // Contar el total de citas
      ]);

      const totalPages = Math.ceil(totalAppointments / validatedPageSize); // Calcular el total de páginas

      return {
        data: appointments,
        meta: {
          page: validatedPage,
          pageSize: validatedPageSize,
          totalPages,
          totalItems: totalAppointments,
        },
      };
    } catch (error) {
      throw new Error(`Error al obtener citas: ${error.message}`);
    }
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
