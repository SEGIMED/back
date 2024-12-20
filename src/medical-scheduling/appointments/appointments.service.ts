import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { status_type } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(data: CreateAppointmentDto) {
    // Validar conflictos de horarios
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        physician_id: data.physician_id,
        OR: [{ start: { lte: data.end }, end: { gte: data.start } }],
      },
    });

    if (conflict) {
      throw new Error('El médico ya tiene una cita en ese horario');
    }

    return this.prisma.appointment.create({ data });
  }

  async getAppointmentsByUser(
    userId: string,
    filters?: { status?: status_type },
  ) {
    return this.prisma.appointment.findMany({
      where: {
        patient_id: userId,
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { start: 'asc' },
    });
  }

  async updateAppointmentStatus(
    id: string,
    status: status_type,
    reason?: string,
  ) {
    if (status === 'cancelled' && !reason) {
      throw new Error('Se requiere una razón para cancelar la cita');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status, cancelation_reason: reason },
    });
  }
}
