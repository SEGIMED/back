import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PatientReminderSettingsService } from './modules/patient-reminder-settings/patient-reminder-settings.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientReminderSettingsService: PatientReminderSettingsService,
  ) {}

  // Delegación a submódulos
  async getPatientReminderSettings(patientId: string) {
    return this.patientReminderSettingsService.getSettings(patientId);
  }

  async updatePatientReminderSettings(
    patientId: string,
    updateData: {
      medication_reminder_interval_minutes?: number;
      medication_reminder_max_retries?: number;
    },
  ) {
    return this.patientReminderSettingsService.updateSettings(
      patientId,
      updateData,
    );
  }

  // Método para obtener todas las configuraciones del paciente (extensible para futuras configuraciones)
  async getAllPatientSettings(patientId: string) {
    const reminderSettings = await this.getPatientReminderSettings(patientId);

    return {
      reminder_settings: reminderSettings,
      // Aquí se pueden agregar más configuraciones en el futuro
      // notification_settings: await this.getNotificationSettings(patientId),
      // privacy_settings: await this.getPrivacySettings(patientId),
    };
  }
}
