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
import { Prisma } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

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

  async getPrescriptionsForTracking(patientId: string, date?: string) {
    try {
      const targetDate = date ? new Date(date) : new Date();

      if (isNaN(targetDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      // Get all prescriptions that are either:
      // 1. Active tracking (is_tracking_active = true)
      // 2. Prescribed by a physician but not yet activated (created_by_patient = false AND is_tracking_active = false)
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          patient_id: patientId,
          OR: [
            { is_tracking_active: true },
            {
              created_by_patient: false,
              is_tracking_active: false,
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
      }); // For each prescription, calculate the scheduled doses for the date
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
  ) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patient_id: patientId,
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
      },
    });

    return updatedPrescription;
  }

  async toggleReminder(
    prescriptionId: string,
    patientId: string,
    toggleDto: ToggleReminderDto,
  ) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patient_id: patientId,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return this.prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        reminder_enabled: toggleDto.reminder_enabled,
      },
    });
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
}
