import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

// DTO para query params de GET /mobile/prescriptions/tracking
export class GetMedicationTrackingQueryDto {
  @ApiProperty({
    description: 'Date to get tracking for (YYYY-MM-DD format)',
    example: '2025-05-30',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

// DTO para respuesta de GET /mobile/prescriptions/tracking
export class MedicationTrackingResponseDto {
  @ApiProperty({
    description: 'Date for which tracking data is provided',
    example: '2025-05-30',
  })
  date: string;

  @ApiProperty({
    description: 'Total number of medications being tracked',
    example: 3,
  })
  total_medications: number;

  @ApiProperty({
    description: 'Number of doses taken on this date',
    example: 5,
  })
  doses_taken: number;

  @ApiProperty({
    description: 'Number of doses missed on this date',
    example: 1,
  })
  doses_missed: number;

  @ApiProperty({
    description: 'Number of doses scheduled for this date',
    example: 6,
  })
  doses_scheduled: number;

  @ApiProperty({
    description: 'Adherence percentage for this date',
    example: 83.33,
  })
  adherence_percentage: number;

  @ApiProperty({
    description: 'List of medications with their tracking details',
    type: 'array',
  })
  medications: MedicationTrackingDetailDto[];
}

export class MedicationTrackingDetailDto {
  @ApiProperty({
    description: 'Prescription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  prescription_id: string;

  @ApiProperty({
    description: 'Medication name',
    example: 'Paracetamol 500mg',
  })
  monodrug: string;

  @ApiProperty({
    description: 'Dose information',
    example: '1 comprimido',
  })
  dose_info: string;

  @ApiProperty({
    description: 'Frequency of medication',
    example: 'daily',
  })
  frecuency: string;

  @ApiProperty({
    description: 'Whether tracking is active for this medication',
    example: true,
  })
  is_tracking_active: boolean;

  @ApiProperty({
    description: 'Whether reminders are enabled',
    example: true,
  })
  reminder_enabled: boolean;

  @ApiProperty({
    description: 'Scheduled time slots for this medication',
    example: ['08:00', '20:00'],
    type: [String],
  })
  time_of_day_slots: string[];

  @ApiProperty({
    description: 'Doses for this specific date',
    type: 'array',
  })
  doses: DoseTrackingDto[];
}

export class DoseTrackingDto {
  @ApiProperty({
    description: 'Dose log ID (if taken)',
    example: '456e7890-e89b-12d3-a456-426614174001',
    required: false,
  })
  dose_log_id?: string;

  @ApiProperty({
    description: 'Scheduled time for this dose',
    example: '08:00',
  })
  scheduled_time: string;

  @ApiProperty({
    description: 'Actual time when dose was taken',
    example: '08:15',
    required: false,
  })
  taken_at?: string;

  @ApiProperty({
    description: 'Status of the dose',
    example: 'taken',
    enum: ['scheduled', 'taken', 'missed', 'skipped'],
  })
  @IsEnum(['scheduled', 'taken', 'missed', 'skipped'])
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';

  @ApiProperty({
    description: 'Reason for skipping (if applicable)',
    example: 'Side effects',
    required: false,
  })
  skip_reason?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Taken with food',
    required: false,
  })
  notes?: string;
}
