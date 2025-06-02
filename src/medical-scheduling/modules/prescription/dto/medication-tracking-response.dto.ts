import { ApiProperty } from '@nestjs/swagger';

// DTO para respuesta de prescripción con información de tracking
export class PrescriptionWithTrackingResponseDto {
  @ApiProperty({
    description: 'Prescription unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Start date and time of the prescription',
    type: Date,
  })
  start_timestamp: Date;

  @ApiProperty({
    description: 'End date and time of the prescription',
    type: Date,
    required: false,
  })
  end_timestamp?: Date;

  @ApiProperty({
    description: 'Prescription description or instructions',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the prescription is active',
  })
  active: boolean;

  @ApiProperty({
    description: 'Name of the monodrug prescribed',
  })
  monodrug: string;

  @ApiProperty({
    description: 'Patient ID',
  })
  patient_id: string;

  // Tracking fields
  @ApiProperty({
    description: 'Whether this prescription was created by the patient',
  })
  created_by_patient: boolean;

  @ApiProperty({
    description: 'Whether medication tracking is currently active',
  })
  is_tracking_active: boolean;

  @ApiProperty({
    description: 'Whether medication reminders are enabled',
  })
  reminder_enabled: boolean;

  @ApiProperty({
    description: 'Timestamp when the first dose was taken',
    type: Date,
    required: false,
  })
  first_dose_taken_at?: Date;

  @ApiProperty({
    description: 'Array of preferred time slots for taking medication',
    type: [String],
    required: false,
  })
  time_of_day_slots?: string[];

  @ApiProperty({
    description: 'Timestamp of the last reminder sent',
    type: Date,
    required: false,
  })
  last_reminder_sent_at?: Date;

  @ApiProperty({
    description: 'Count of reminders sent for this prescription',
  })
  reminders_sent_count: number;

  @ApiProperty({
    description: 'Skip reason information',
    required: false,
  })
  skip_reason?: {
    id: number;
    reason_text: string;
    category: string;
  };

  @ApiProperty({
    description: 'Additional details about why the prescription was skipped',
    required: false,
  })
  skip_reason_details?: string;

  @ApiProperty({
    description: 'Timestamps',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updated_at: Date;
}

// DTO para estadísticas de adherencia del paciente
export class MedicationAdherenceStatsDto {
  @ApiProperty({
    description: 'Patient ID',
  })
  patient_id: string;

  @ApiProperty({
    description: 'Prescription ID (if specific to one prescription)',
    required: false,
  })
  prescription_id?: string;

  @ApiProperty({
    description: 'Total number of scheduled doses in the period',
  })
  total_scheduled_doses: number;

  @ApiProperty({
    description: 'Number of doses actually taken',
  })
  doses_taken: number;

  @ApiProperty({
    description: 'Number of doses missed automatically (no user input)',
  })
  doses_missed_automatic: number;

  @ApiProperty({
    description: 'Number of doses missed and reported by user',
  })
  doses_missed_reported: number;

  @ApiProperty({
    description: 'Number of doses intentionally skipped by user',
  })
  doses_skipped_by_user: number;

  @ApiProperty({
    description: 'Adherence percentage (doses_taken / total_scheduled_doses)',
  })
  adherence_percentage: number;

  @ApiProperty({
    description: 'Period start date for the statistics',
    type: Date,
  })
  period_start: Date;

  @ApiProperty({
    description: 'Period end date for the statistics',
    type: Date,
  })
  period_end: Date;
  @ApiProperty({
    description: 'Breakdown by skip reasons',
    additionalProperties: true,
  })
  skip_reasons_breakdown: {
    [category: string]: {
      count: number;
      reasons: Array<{
        reason_text: string;
        count: number;
      }>;
    };
  };
}

// DTO para resumen de tracking activo
export class ActiveTrackingMedicationsDto {
  @ApiProperty({
    description: 'Patient ID',
  })
  patient_id: string;

  @ApiProperty({
    description: 'List of active prescriptions with tracking enabled',
    type: [PrescriptionWithTrackingResponseDto],
  })
  active_prescriptions: PrescriptionWithTrackingResponseDto[];

  @ApiProperty({
    description: 'Next scheduled doses across all active prescriptions',
  })
  next_scheduled_doses: Array<{
    prescription_id: string;
    monodrug: string;
    scheduled_time: Date;
    time_slot: string;
  }>;

  @ApiProperty({
    description: 'Patient reminder settings',
  })
  reminder_settings: {
    medication_reminder_interval_minutes: number;
    medication_reminder_max_retries: number;
  };

  @ApiProperty({
    description: 'Overall adherence summary for the current period',
  })
  adherence_summary: {
    total_prescriptions_with_tracking: number;
    average_adherence_percentage: number;
    last_30_days_adherence: number;
  };
}
