import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
// Service for handling prescription operations
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSelfAssignedPrescriptionDto,
  FrequencyType,
} from './dto/create-self-assigned-prescription.dto';
import { ActivateTrackingDto, ToggleReminderDto } from './dto/tracking.dto';
import {
  CreateMedicationDoseLogDto,
  SkipMedicationDoseDto,
  AdjustDoseTimeDto,
} from './dto/medication-dose-log.dto';
import { CancelTrackingDto } from './dto/cancel-tracking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene los tenant IDs del paciente de forma optimizada
   */
  private async getPatientTenantIds(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<string[]> {
    // Si los tenants vienen del JWT, usarlos directamente
    if (userTenants && userTenants.length > 0) {
      return userTenants.map((tenant) => tenant.id);
    }

    // Sino, buscar en la DB con el patient_id directamente
    const patientTenants = await this.prisma.patient_tenant.findMany({
      where: {
        patient: {
          user_id: patientId,
        },
        deleted: false,
      },
      select: { tenant_id: true },
    });

    return patientTenants.map((pt) => pt.tenant_id);
  }

  async createSelfAssignedPrescription(
    patientId: string,
    createDto: CreateSelfAssignedPrescriptionDto,
  ) {
    try {
      // Calculate time_of_day_slots based on frequency and first dose
      const timeOfDaySlots = this.calculateTimeSlots(
        createDto.frequency_type,
        createDto.frequency_value,
        createDto.first_dose_time,
      );

      // Create the prescription record
      const prescription = await this.prisma.prescription.create({
        data: {
          patient_id: patientId,
          monodrug: createDto.monodrug,
          created_by_patient: true,
          is_tracking_active: true,
          reminder_enabled: true,
          first_dose_taken_at: createDto.first_dose_time,
          time_of_day_slots: timeOfDaySlots,
          // Las prescripciones creadas por el paciente no tienen tenant_id
          // ya que son auto-asignadas y no pertenecen a una organización específica
        },
      });

      // Create the prescription modification history record
      await this.prisma.pres_mod_history.create({
        data: {
          prescription_id: prescription.id,
          physician_id: patientId, // In this case, the patient is the one creating it
          dose: createDto.dose,
          dose_units: createDto.dose_units,
          frecuency: this.formatFrequency(
            createDto.frequency_type,
            createDto.frequency_value,
          ),
          duration: '30', // Default duration
          duration_units: 'días',
          observations: createDto.observations || '',
        },
      });

      return prescription;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Error creating prescription: ' + error.message,
        );
      }
      throw error;
    }
  }

  async getPrescriptionsForTracking(
    patientId: string,
    date?: string,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    try {
      const targetDate = date ? new Date(date) : new Date();

      if (isNaN(targetDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      // Get all prescriptions that are either:
      // 1. Active tracking (is_tracking_active = true)
      // 2. Prescribed by a physician but not yet activated (created_by_patient = false AND is_tracking_active = false)
      // Incluye tanto prescripciones de organizaciones (con tenant_id) como auto-asignadas (sin tenant_id)
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          patient_id: patientId,
          OR: [
            // Prescripciones con tracking activo (incluye auto-asignadas y de organizaciones)
            { is_tracking_active: true },
            // Prescripciones de médicos no activadas de las organizaciones del paciente
            {
              created_by_patient: false,
              is_tracking_active: false,
              tenant_id: { in: tenantIds },
            },
          ],
        },
        include: {
          pres_mod_history: {
            orderBy: {
              mod_timestamp: 'desc',
            },
            take: 1,
          },
          medication_dose_logs: {
            where: {
              scheduled_time: {
                gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                lt: new Date(targetDate.setHours(23, 59, 59, 999)),
              },
            },
          },
        },
      });

      // For each prescription, calculate the scheduled doses for the date
      const result = prescriptions.map((prescription) => {
        const latestModHistory = prescription.pres_mod_history[0];

        // Calculate scheduled doses for this day
        let scheduledDoses = [];
        if (
          prescription.is_tracking_active &&
          prescription.time_of_day_slots?.length > 0
        ) {
          scheduledDoses = this.calculateScheduledDosesForDate(
            prescription.time_of_day_slots,
            targetDate,
          );
        } else if (!prescription.is_tracking_active && latestModHistory) {
          // For non-active prescriptions, we'll just show the frequency from the history
          scheduledDoses = [
            {
              scheduledTime: null,
              status: 'PENDING_ACTIVATION',
              message: `Activar seguimiento (${latestModHistory.frecuency})`,
            },
          ];
        }

        // Map actual medication logs to the scheduled doses where they exist
        const dosesWithStatus = scheduledDoses.map((scheduledDose) => {
          // Handle case where medication_dose_logs might be undefined
          const medicationLogs = prescription.medication_dose_logs || [];

          const matchingLog = medicationLogs.find(
            (log) =>
              log.scheduled_time.getTime() ===
              scheduledDose.scheduledTime?.getTime(),
          );

          if (matchingLog) {
            return {
              ...scheduledDose,
              status: matchingLog.status,
              actualTakenTime: matchingLog.actual_taken_time,
              logId: matchingLog.id,
            };
          }

          return scheduledDose;
        });

        return {
          id: prescription.id,
          monodrug: prescription.monodrug,
          isTrackingActive: prescription.is_tracking_active,
          reminderEnabled: prescription.reminder_enabled,
          createdByPatient: prescription.created_by_patient,
          doseDetails: latestModHistory
            ? {
                dose: latestModHistory.dose,
                doseUnits: latestModHistory.dose_units,
                frequency: latestModHistory.frecuency,
              }
            : null,
          doses: dosesWithStatus,
        };
      });

      // Sort result by earliest scheduled dose time
      return result.sort((a, b) => {
        const aTime =
          a.doses[0]?.scheduledTime?.getTime() || Number.MAX_SAFE_INTEGER;
        const bTime =
          b.doses[0]?.scheduledTime?.getTime() || Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error retrieving prescriptions: ' + error.message,
      );
    }
  }

  async activateTracking(
    prescriptionId: string,
    patientId: string,
    activateDto: ActivateTrackingDto,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    console.log('activateTracking', prescriptionId, patientId, activateDto);
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          patient_id: patientId,
          OR: [
            // Prescripciones de organizaciones del paciente
            { tenant_id: { in: tenantIds } },
            // Prescripciones auto-asignadas (sin tenant_id)
            {
              created_by_patient: true,
              tenant_id: null,
            },
          ],
        },
        include: {
          pres_mod_history: {
            orderBy: {
              mod_timestamp: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      if (prescription.is_tracking_active) {
        throw new BadRequestException(
          'Tracking is already active for this prescription',
        );
      }
      const latestModHistory = prescription.pres_mod_history[0];
      if (!latestModHistory) {
        throw new BadRequestException('No prescription details found');
      }

      // Validate that the first dose time is a valid date
      if (isNaN(activateDto.first_dose_taken_at.getTime())) {
        throw new BadRequestException('Invalid first dose date format');
      }

      // Parse frequency to determine time slots
      const { frequencyType, frequencyValue } = this.parseFrequency(
        latestModHistory.frecuency,
      );

      // Calculate time slots based on first dose and frequency
      const timeOfDaySlots = this.calculateTimeSlots(
        frequencyType,
        frequencyValue,
        activateDto.first_dose_taken_at,
      );

      // Update the prescription
      const updatedPrescription = await this.prisma.prescription.update({
        where: {
          id: prescriptionId,
        },
        data: {
          is_tracking_active: true,
          first_dose_taken_at: activateDto.first_dose_taken_at,
          time_of_day_slots: timeOfDaySlots,
        },
      });

      // Create the first dose log as "TAKEN"
      await this.prisma.medication_dose_log.create({
        data: {
          prescription_id: prescriptionId,
          user_id: patientId,
          scheduled_time: activateDto.first_dose_taken_at,
          actual_taken_time: activateDto.first_dose_taken_at,
          status: 'TAKEN',
          reported_at: new Date(), // Explicitly set the reported time to now
        },
      });

      return {
        ...updatedPrescription,
        timeOfDaySlots,
        message: 'Tracking activated successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error activating tracking: ' + error.message,
      );
    }
  }

  async toggleReminder(
    prescriptionId: string,
    patientId: string,
    toggleDto: ToggleReminderDto,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      // Find the prescription for the patient
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          patient_id: patientId,
          OR: [
            // Prescripciones de organizaciones del paciente
            { tenant_id: { in: tenantIds } },
            // Prescripciones auto-asignadas (sin tenant_id)
            {
              created_by_patient: true,
              tenant_id: null,
            },
          ],
        },
      });

      // Verify the prescription exists
      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      // Verify tracking is active - we only allow reminder toggle for active prescriptions
      if (!prescription.is_tracking_active) {
        throw new BadRequestException(
          'Cannot toggle reminders for prescriptions without active tracking',
        );
      }

      // Update the reminder setting
      const updatedPrescription = await this.prisma.prescription.update({
        where: {
          id: prescriptionId,
        },
        data: {
          reminder_enabled: toggleDto.reminder_enabled,
        },
      });

      // Return the updated prescription with a success message
      return {
        ...updatedPrescription,
        message: toggleDto.reminder_enabled
          ? 'Reminders enabled successfully'
          : 'Reminders disabled successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error toggling reminders: ' + error.message,
      );
    }
  }
  /**
   * Create a new medication dose log entry
   */
  async createMedicationDoseLog(
    patientId: string,
    createDto: CreateMedicationDoseLogDto,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      // Verify the prescription belongs to the patient
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: createDto.prescription_id,
          patient_id: patientId,
          is_tracking_active: true,
          OR: [
            // Prescripciones de organizaciones del paciente
            { tenant_id: { in: tenantIds } },
            // Prescripciones auto-asignadas (sin tenant_id)
            {
              created_by_patient: true,
              tenant_id: null,
            },
          ],
        },
      });

      if (!prescription) {
        throw new NotFoundException(
          'Active prescription not found for this patient',
        );
      }

      // If scheduled_time is not provided, we need to infer it from current time and time slots
      let scheduledTime = createDto.scheduled_time;
      if (!scheduledTime && prescription.time_of_day_slots?.length > 0) {
        scheduledTime = this.inferScheduledTime(prescription.time_of_day_slots);
      }

      if (!scheduledTime) {
        throw new BadRequestException(
          'scheduled_time is required when prescription has no time slots',
        );
      }

      // Validate that actual_taken_time is provided if status is TAKEN
      if (createDto.status === 'TAKEN' && !createDto.actual_taken_time) {
        throw new BadRequestException(
          'actual_taken_time is required when status is TAKEN',
        );
      }

      // Create the medication dose log
      const doseLog = await this.prisma.medication_dose_log.create({
        data: {
          prescription_id: createDto.prescription_id,
          user_id: patientId,
          scheduled_time: scheduledTime,
          actual_taken_time: createDto.actual_taken_time,
          status: createDto.status,
          reported_at: new Date(),
        },
        include: {
          skip_reason: true,
        },
      });

      // If status is TAKEN, reset reminders_sent_count to 0
      if (createDto.status === 'TAKEN') {
        await this.prisma.prescription.update({
          where: { id: createDto.prescription_id },
          data: { reminders_sent_count: 0 },
        });
      }

      return {
        id: doseLog.id,
        prescription_id: doseLog.prescription_id,
        user_id: doseLog.user_id,
        status: doseLog.status,
        scheduled_time: doseLog.scheduled_time,
        actual_taken_time: doseLog.actual_taken_time,
        reported_at: doseLog.reported_at,
        skip_reason: doseLog.skip_reason,
        skip_reason_details: doseLog.skip_reason_details,
        created_at: doseLog.created_at,
        updated_at: doseLog.updated_at,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error creating medication dose log: ' + error.message,
      );
    }
  }

  /**
   * Infer scheduled time from current time and time slots
   */
  private inferScheduledTime(timeSlots: string[]): Date {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Find the closest time slot
    let closestSlot = timeSlots[0];
    let minDifference = Infinity;

    for (const slot of timeSlots) {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotTime = hours * 60 + minutes;
      const difference = Math.abs(currentTime - slotTime);

      if (difference < minDifference) {
        minDifference = difference;
        closestSlot = slot;
      }
    }

    // Create the scheduled time for today
    const [hours, minutes] = closestSlot.split(':').map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    return scheduledTime;
  }
  /**
   * Skip a medication dose by marking it as SKIPPED_BY_USER
   */
  async skipMedicationDose(
    patientId: string,
    logId: string,
    skipDto: SkipMedicationDoseDto,
  ) {
    try {
      // Find the dose log and verify it belongs to the patient
      const doseLog = await this.prisma.medication_dose_log.findFirst({
        where: {
          id: logId,
          user_id: patientId,
        },
        include: {
          prescription: true,
        },
      });

      if (!doseLog) {
        throw new NotFoundException('Dose log not found for this patient');
      }

      // Update the dose log with skip information
      const updatedDoseLog = await this.prisma.medication_dose_log.update({
        where: { id: logId },
        data: {
          status: 'SKIPPED_BY_USER',
          skip_reason_id: skipDto.skip_reason_id,
          skip_reason_details: skipDto.skip_reason_details,
          reported_at: new Date(),
        },
        include: {
          skip_reason: true,
        },
      });

      // Reset reminders_sent_count to 0 in the prescription
      await this.prisma.prescription.update({
        where: { id: doseLog.prescription_id },
        data: { reminders_sent_count: 0 },
      });

      return {
        id: updatedDoseLog.id,
        prescription_id: updatedDoseLog.prescription_id,
        user_id: updatedDoseLog.user_id,
        status: updatedDoseLog.status,
        scheduled_time: updatedDoseLog.scheduled_time,
        actual_taken_time: updatedDoseLog.actual_taken_time,
        reported_at: updatedDoseLog.reported_at,
        skip_reason: updatedDoseLog.skip_reason,
        skip_reason_details: updatedDoseLog.skip_reason_details,
        created_at: updatedDoseLog.created_at,
        updated_at: updatedDoseLog.updated_at,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error skipping medication dose: ' + error.message,
      );
    }
  }
  /**
   * Adjust the actual taken time for a dose
   */
  async adjustDoseTime(
    patientId: string,
    logId: string,
    adjustDto: AdjustDoseTimeDto,
  ) {
    try {
      // Find the dose log and verify it belongs to the patient
      const doseLog = await this.prisma.medication_dose_log.findFirst({
        where: {
          id: logId,
          user_id: patientId,
          status: 'TAKEN', // Only allow adjusting taken doses
        },
      });

      if (!doseLog) {
        throw new NotFoundException(
          'Taken dose log not found for this patient',
        );
      }

      // Update the actual taken time
      const updatedDoseLog = await this.prisma.medication_dose_log.update({
        where: { id: logId },
        data: {
          actual_taken_time: adjustDto.actual_taken_time,
          updated_at: new Date(),
        },
        include: {
          skip_reason: true,
        },
      });

      // TODO: Recalculate adherence window if needed
      // This would involve checking if the new time affects adherence calculations

      return {
        id: updatedDoseLog.id,
        prescription_id: updatedDoseLog.prescription_id,
        user_id: updatedDoseLog.user_id,
        status: updatedDoseLog.status,
        scheduled_time: updatedDoseLog.scheduled_time,
        actual_taken_time: updatedDoseLog.actual_taken_time,
        reported_at: updatedDoseLog.reported_at,
        skip_reason: updatedDoseLog.skip_reason,
        skip_reason_details: updatedDoseLog.skip_reason_details,
        created_at: updatedDoseLog.created_at,
        updated_at: updatedDoseLog.updated_at,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error adjusting dose time: ' + error.message,
      );
    }
  }

  // Helper methods

  private calculateTimeSlots(
    frequencyType: FrequencyType,
    frequencyValue: number,
    firstDoseTime: Date,
  ): string[] {
    const slots: string[] = [];
    const firstDose = new Date(firstDoseTime);

    // Add the first dose time
    slots.push(this.formatTimeSlot(firstDose));

    if (frequencyType === FrequencyType.ONCE_DAILY) {
      // Only one dose per day at the same time
      return slots;
    } else if (frequencyType === FrequencyType.EVERY_X_HOURS) {
      // Calculate doses every X hours
      const hoursToAdd = frequencyValue;
      const dosesPerDay = Math.floor(24 / hoursToAdd);

      let currentTime = new Date(firstDose);
      for (let i = 1; i < dosesPerDay; i++) {
        currentTime = new Date(
          currentTime.getTime() + hoursToAdd * 60 * 60 * 1000,
        );
        slots.push(this.formatTimeSlot(currentTime));
      }
    } else if (frequencyType === FrequencyType.TIMES_PER_DAY) {
      // Evenly distribute the doses throughout waking hours (8am-10pm)
      const wakingHours = 14; // 8am to 10pm
      const hoursInterval = wakingHours / (frequencyValue - 1);

      // Adjust the first dose to be within waking hours if needed
      const startHour = 8; // 8am
      let currentTime = new Date(firstDose);

      for (let i = 1; i < frequencyValue; i++) {
        currentTime = new Date(currentTime);
        currentTime.setHours(
          startHour + Math.round(hoursInterval * i),
          0,
          0,
          0,
        );
        slots.push(this.formatTimeSlot(currentTime));
      }
    }

    return slots;
  }

  private formatTimeSlot(date: Date): string {
    // Format as HH:MM
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  private formatFrequency(
    frequencyType: FrequencyType,
    frequencyValue: number,
  ): string {
    switch (frequencyType) {
      case FrequencyType.EVERY_X_HOURS:
        return `Cada ${frequencyValue} horas`;
      case FrequencyType.TIMES_PER_DAY:
        return `${frequencyValue} veces al día`;
      case FrequencyType.ONCE_DAILY:
        return 'Una vez al día';
      default:
        return `${frequencyValue} veces al día`;
    }
  }

  private parseFrequency(frequencyStr: string): {
    frequencyType: FrequencyType;
    frequencyValue: number;
  } {
    if (frequencyStr.includes('Cada') && frequencyStr.includes('horas')) {
      const value = parseInt(frequencyStr.replace(/[^0-9]/g, ''), 10);
      return {
        frequencyType: FrequencyType.EVERY_X_HOURS,
        frequencyValue: value,
      };
    } else if (frequencyStr.includes('veces al día')) {
      const value = parseInt(frequencyStr.replace(/[^0-9]/g, ''), 10);
      return {
        frequencyType: FrequencyType.TIMES_PER_DAY,
        frequencyValue: value,
      };
    } else if (frequencyStr.includes('Una vez al día')) {
      return {
        frequencyType: FrequencyType.ONCE_DAILY,
        frequencyValue: 1,
      };
    }

    // Default to once daily if we can't parse
    return {
      frequencyType: FrequencyType.ONCE_DAILY,
      frequencyValue: 1,
    };
  }

  private calculateScheduledDosesForDate(
    timeSlots: string[],
    date: Date,
  ): any[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return timeSlots.map((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      const scheduledTime = new Date(targetDate);
      scheduledTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      let status = 'PENDING';
      if (scheduledTime < now) {
        status = 'MISSED';
      }

      return {
        scheduledTime,
        status,
        timeSlot: slot,
      };
    });
  }

  async cancelTracking(
    prescriptionId: string,
    patientId: string,
    cancelDto: CancelTrackingDto,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    try {
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          patient_id: patientId,
          OR: [
            { tenant_id: { in: tenantIds } },
            {
              created_by_patient: true,
              tenant_id: null,
            },
          ],
        },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      const updatedPrescription = await this.prisma.prescription.update({
        where: {
          id: prescriptionId,
        },
        data: {
          is_tracking_active: false,
          reminder_enabled: false,
          skip_reason_id: cancelDto.skip_reason_id,
          skip_reason_details: cancelDto.skip_reason_details,
        },
      });

      return {
        ...updatedPrescription,
        message: 'Tracking cancelled successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error cancelling tracking: ' + error.message,
      );
    }
  }

  async getMedicationSkipReasons() {
    try {
      const skipReasons =
        await this.prisma.medication_skip_reason_catalog.findMany({
          orderBy: {
            category: 'asc',
          },
        });

      return skipReasons;
    } catch (error) {
      throw new BadRequestException(
        'Error retrieving medication skip reasons: ' + error.message,
      );
    }
  }
}
