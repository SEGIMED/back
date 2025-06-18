import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { status_type } from '@prisma/client';

@Injectable()
export class AppointmentSchedulerService {
  private readonly logger = new Logger(AppointmentSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}
  /**
   * Cron job que se ejecuta diariamente para revisar citas pendientes que ya han finalizado
   * y marcarlas como "no_asistida"
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processExpiredAppointments(): Promise<void> {
    this.logger.log(
      'Iniciando procesamiento de citas expiradas para marcar como no_asistida...',
    );

    try {
      const expiredAppointments = await this.getExpiredPendingAppointments();
      if (expiredAppointments.length === 0) {
        this.logger.log('No se encontraron citas pendientes expiradas');
        return;
      }

      this.logger.log(
        `Encontradas ${expiredAppointments.length} citas pendientes expiradas`,
      );

      const updatedCount =
        await this.markAppointmentsAsMissed(expiredAppointments);

      this.logger.log(
        `Procesamiento completado: ${updatedCount} citas marcadas como no_asistida`,
      );
    } catch (error) {
      this.logger.error('Error procesando citas expiradas:', error);
    }
  }
  /**
   * Obtiene todas las citas con estado "pendiente" cuya fecha/hora de fin ya ha pasado
   */
  private async getExpiredPendingAppointments() {
    const now = new Date();

    return await this.prisma.appointment.findMany({
      where: {
        status: status_type.pendiente,
        end: {
          lt: now, // end time is less than current time
        },
        deleted: false,
      },
      select: {
        id: true,
        consultation_reason: true,
        start: true,
        end: true,
        patient_id: true,
        physician_id: true,
        tenant_id: true,
        patient: {
          select: {
            name: true,
            last_name: true,
            email: true,
          },
        },
        physician: {
          select: {
            name: true,
            last_name: true,
          },
        },
      },
    });
  }
  /**
   * Actualiza las citas expiradas marcándolas como "no_asistida"
   */
  private async markAppointmentsAsMissed(
    expiredAppointments: Array<{
      id: string;
      consultation_reason: string;
      start: Date;
      end: Date;
      patient_id: string;
      physician_id: string;
      tenant_id: string;
      patient: {
        name: string;
        last_name: string | null;
        email: string;
      };
      physician: {
        name: string;
        last_name: string | null;
      };
    }>,
  ): Promise<number> {
    const appointmentIds = expiredAppointments.map((apt) => apt.id);

    const result = await this.prisma.appointment.updateMany({
      where: {
        id: {
          in: appointmentIds,
        },
        status: status_type.pendiente, // Double-check to ensure only pending appointments are updated
      },
      data: {
        status: 'no_asistida' as status_type,
        updated_at: new Date(),
      },
    });

    // Log each appointment that was updated for audit purposes
    for (const appointment of expiredAppointments) {
      this.logger.debug(
        `Cita marcada como no_asistida - ID: ${appointment.id}, ` +
          `Paciente: ${appointment.patient?.name} ${appointment.patient?.last_name}, ` +
          `Médico: ${appointment.physician?.name} ${appointment.physician?.last_name}, ` +
          `Fecha fin: ${appointment.end}`,
      );
    }

    return result.count;
  }
  /**
   * Método manual para procesar citas expiradas (útil para testing o ejecución manual)
   */
  async manualProcessExpiredAppointments(): Promise<{
    processedCount: number;
    expiredAppointments: any[];
  }> {
    this.logger.log('Procesamiento manual de citas expiradas iniciado');

    const expiredAppointments = await this.getExpiredPendingAppointments();
    const processedCount =
      expiredAppointments.length > 0
        ? await this.markAppointmentsAsMissed(expiredAppointments)
        : 0;

    return {
      processedCount,
      expiredAppointments,
    };
  }

  /**
   * Obtiene estadísticas de citas por estado en un rango de fechas
   */
  async getAppointmentStatusStatistics(
    startDate?: Date,
    endDate?: Date,
    tenantId?: string,
  ): Promise<{
    total: number;
    pendiente: number;
    atendida: number;
    cancelada: number;
    no_asistida: number;
  }> {
    const whereClause: any = {
      deleted: false,
    };

    if (startDate && endDate) {
      whereClause.start = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (tenantId) {
      whereClause.tenant_id = tenantId;
    }

    const appointments = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    });

    const stats = {
      total: 0,
      pendiente: 0,
      atendida: 0,
      cancelada: 0,
      no_asistida: 0,
    };

    appointments.forEach((group) => {
      const count = group._count.status;
      stats[group.status as keyof typeof stats] = count;
      stats.total += count;
    });

    return stats;
  }
}
