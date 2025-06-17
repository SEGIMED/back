import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MedicationSchedulerService {
  private readonly logger = new Logger(MedicationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledReminders(): Promise<void> {
    this.logger.log(
      'Iniciando procesamiento de recordatorios de medicación...',
    );

    try {
      const activePrescriptions = await this.getActivePrescriptions();
      this.logger.log(
        `Encontradas ${activePrescriptions.length} prescriptions activas`,
      );

      for (const prescription of activePrescriptions) {
        await this.processPrescriptionReminder(prescription);
      }

      this.logger.log('Procesamiento de recordatorios completado exitosamente');
    } catch (error) {
      this.logger.error('Error procesando recordatorios de medicación:', error);
    }
  }
  private async getActivePrescriptions() {
    return await this.prisma.prescription.findMany({
      where: {
        is_tracking_active: true,
        reminder_enabled: true,
      },
      include: {
        user: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  private async processPrescriptionReminder(prescription: any): Promise<void> {
    try {
      if (
        !prescription.time_of_day_slots ||
        prescription.time_of_day_slots.length === 0
      ) {
        this.logger.debug(
          `Prescription ${prescription.id}: sin time_of_day_slots configurados`,
        );
        return;
      }

      const nextReminderTime = this.calculateNextReminderTime(
        prescription.time_of_day_slots,
      );

      if (!nextReminderTime) {
        this.logger.debug(
          `Prescription ${prescription.id}: no hay próxima hora de recordatorio`,
        );
        return;
      }

      const currentTime = new Date();
      const timeDiff = Math.abs(
        currentTime.getTime() - nextReminderTime.getTime(),
      );
      const toleranceMs = 2.5 * 60 * 1000;

      if (timeDiff <= toleranceMs) {
        await this.handleReminderTime(prescription);
      } else {
        await this.checkForMissedDoses(prescription);
      }
    } catch (error) {
      this.logger.error(
        `Error procesando prescription ${prescription.id}:`,
        error,
      );
    }
  }

  private calculateNextReminderTime(timeSlots: string[]): Date | null {
    if (!timeSlots || timeSlots.length === 0) {
      return null;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const slotsInMinutes = timeSlots
      .map((slot) => {
        const [hours, minutes] = slot.split(':').map(Number);
        return hours * 60 + minutes;
      })
      .sort((a, b) => a - b);

    const nextSlotToday = slotsInMinutes.find((slot) => slot > currentTime);

    if (nextSlotToday) {
      const nextTime = new Date(now);
      nextTime.setHours(
        Math.floor(nextSlotToday / 60),
        nextSlotToday % 60,
        0,
        0,
      );
      return nextTime;
    } else {
      const firstSlot = slotsInMinutes[0];
      const nextTime = new Date(now);
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(Math.floor(firstSlot / 60), firstSlot % 60, 0, 0);
      return nextTime;
    }
  }

  private async handleReminderTime(prescription: any): Promise<void> {
    try {
      if (prescription.last_reminder_sent_at) {
        const timeSinceLastReminder =
          Date.now() - new Date(prescription.last_reminder_sent_at).getTime();
        const minIntervalMs = 5 * 60 * 1000;

        if (timeSinceLastReminder < minIntervalMs) {
          this.logger.debug(
            `Prescription ${prescription.id}: recordatorio ya enviado recientemente`,
          );
          return;
        }
      }

      await this.sendPushNotification(prescription);

      await this.prisma.prescription.update({
        where: { id: prescription.id },
        data: {
          reminders_sent_count: (prescription.reminders_sent_count || 0) + 1,
          last_reminder_sent_at: new Date(),
        },
      });

      this.logger.log(
        `Recordatorio enviado para prescription ${prescription.id}, contador: ${(prescription.reminders_sent_count || 0) + 1}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando recordatorio para prescription ${prescription.id}:`,
        error,
      );
    }
  }

  private async checkForMissedDoses(prescription: any): Promise<void> {
    const maxRetries =
      prescription.user?.patient?.medication_reminder_max_retries || 3;
    const currentReminders = prescription.reminders_sent_count || 0;

    if (currentReminders >= maxRetries && prescription.last_reminder_sent_at) {
      const intervalMinutes =
        prescription.user?.patient?.medication_reminder_interval_minutes || 30;
      const timeSinceLastReminder =
        Date.now() - new Date(prescription.last_reminder_sent_at).getTime();
      const maxWaitTimeMs = intervalMinutes * 60 * 1000;

      if (timeSinceLastReminder > maxWaitTimeMs) {
        await this.createMissedDoseLog(prescription);
      }
    }
  }
  private async createMissedDoseLog(prescription: any): Promise<void> {
    try {
      await this.prisma.medication_dose_log.create({
        data: {
          prescription_id: prescription.id,
          user_id: prescription.user.patient.id,
          scheduled_time: prescription.last_reminder_sent_at,
          status: 'MISSED_AUTOMATIC',
          reported_at: new Date(),
        },
      });

      await this.prisma.prescription.update({
        where: { id: prescription.id },
        data: {
          reminders_sent_count: 0,
        },
      });

      this.logger.log(
        `Dosis marcada como perdida automáticamente para prescription ${prescription.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error creando log de dosis perdida para prescription ${prescription.id}:`,
        error,
      );
    }
  }

  private async sendPushNotification(prescription: any): Promise<void> {
    try {
      const medicationName = prescription.monodrug;
      const user = prescription.user;

      if (!user) {
        this.logger.warn(
          `No se encontró usuario para prescription ${prescription.id}`,
        );
        return;
      }

      const medications = [
        {
          monodrug: medicationName,
          dose: '',
          dose_units: '',
          frecuency: '',
          duration: '',
          duration_units: '',
          observations: 'Recordatorio automático de medicación',
        },
      ];

      if (user.phone && user.is_phone_verified) {
        await this.notificationService.sendMedicationUpdateNotification(
          user,
          medications,
          'Sistema Segimed',
        );

        this.logger.log(
          `Notificación de recordatorio enviada para prescription ${prescription.id}`,
        );
      } else {
        this.logger.warn(
          `User ${user.id} no tiene teléfono verificado para enviar recordatorio`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error enviando notificación de recordatorio para prescription ${prescription.id}:`,
        error,
      );
    }
  }
}
