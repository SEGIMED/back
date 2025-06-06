import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';

@Injectable()
export class PatientReminderSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene las configuraciones de recordatorios de medicación de un paciente
   */
  async getSettings(patientId: string) {
    // Primero verificamos si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: {
        patient: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Si no tiene registro de paciente, lo creamos con valores por defecto
    if (!user.patient) {
      const newPatient = await this.prisma.patient.create({
        data: {
          user_id: patientId,
          medication_reminder_interval_minutes: 30,
          medication_reminder_max_retries: 3,
        },
      });

      return {
        patient_id: patientId,
        medication_reminder_interval_minutes:
          newPatient.medication_reminder_interval_minutes,
        medication_reminder_max_retries:
          newPatient.medication_reminder_max_retries,
        updated_at: newPatient.updated_at,
      };
    }

    return {
      patient_id: patientId,
      medication_reminder_interval_minutes:
        user.patient.medication_reminder_interval_minutes || 30,
      medication_reminder_max_retries:
        user.patient.medication_reminder_max_retries || 3,
      updated_at: user.patient.updated_at,
    };
  }

  /**
   * Actualiza las configuraciones de recordatorios de medicación de un paciente
   */
  async updateSettings(
    patientId: string,
    updateData: {
      medication_reminder_interval_minutes?: number;
      medication_reminder_max_retries?: number;
    },
  ) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: {
        patient: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validaciones de datos
    if (updateData.medication_reminder_interval_minutes !== undefined) {
      if (
        updateData.medication_reminder_interval_minutes < 1 ||
        updateData.medication_reminder_interval_minutes > 1440
      ) {
        throw new Error(
          'Reminder interval must be between 1 and 1440 minutes (24 hours)',
        );
      }
    }

    if (updateData.medication_reminder_max_retries !== undefined) {
      if (
        updateData.medication_reminder_max_retries < 0 ||
        updateData.medication_reminder_max_retries > 10
      ) {
        throw new Error('Max retries must be between 0 and 10');
      }
    }

    let updatedPatient;

    // Si no existe el registro de paciente, lo creamos
    if (!user.patient) {
      updatedPatient = await this.prisma.patient.create({
        data: {
          user_id: patientId,
          medication_reminder_interval_minutes:
            updateData.medication_reminder_interval_minutes || 30,
          medication_reminder_max_retries:
            updateData.medication_reminder_max_retries || 3,
        },
      });
    } else {
      // Si existe, lo actualizamos
      updatedPatient = await this.prisma.patient.update({
        where: { user_id: patientId },
        data: {
          medication_reminder_interval_minutes:
            updateData.medication_reminder_interval_minutes,
          medication_reminder_max_retries:
            updateData.medication_reminder_max_retries,
        },
      });
    }

    return {
      patient_id: patientId,
      medication_reminder_interval_minutes:
        updatedPatient.medication_reminder_interval_minutes,
      medication_reminder_max_retries:
        updatedPatient.medication_reminder_max_retries,
      updated_at: updatedPatient.updated_at,
      message: 'Reminder settings updated successfully',
    };
  }

  /**
   * Restablece las configuraciones a los valores por defecto
   */
  async resetToDefaults(patientId: string) {
    return this.updateSettings(patientId, {
      medication_reminder_interval_minutes: 30,
      medication_reminder_max_retries: 3,
    });
  }

  /**
   * Verifica si un paciente tiene configuraciones personalizadas
   */
  async hasCustomSettings(patientId: string): Promise<boolean> {
    const settings = await this.getSettings(patientId);

    return (
      settings.medication_reminder_interval_minutes !== 30 ||
      settings.medication_reminder_max_retries !== 3
    );
  }
}
