import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para activar tracking de medicación
export class ActivateMedicationTrackingDto {
  @ApiProperty({
    description: 'Prescription ID to activate tracking for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  prescription_id: string;

  @ApiProperty({
    description: 'Enable medication reminders',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  reminder_enabled?: boolean;

  @ApiProperty({
    description:
      'Array of preferred time slots for taking medication (e.g., ["08:00", "20:00"])',
    example: ['08:00', '14:00', '20:00'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  time_of_day_slots?: string[];

  @ApiProperty({
    description: 'Timestamp when the first dose was taken',
    example: '2025-05-29T08:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  first_dose_taken_at?: Date;
}

// DTO para actualizar configuración de tracking
export class UpdateMedicationTrackingDto {
  @ApiProperty({
    description: 'Enable or disable medication tracking',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_tracking_active?: boolean;

  @ApiProperty({
    description: 'Enable or disable medication reminders',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  reminder_enabled?: boolean;

  @ApiProperty({
    description:
      'Array of preferred time slots for taking medication (e.g., ["08:00", "20:00"])',
    example: ['08:00', '14:00', '20:00'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  time_of_day_slots?: string[];

  @ApiProperty({
    description: 'Reference to skip reason catalog if prescription was skipped',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  skip_reason_id?: number;

  @ApiProperty({
    description: 'Additional details about why the prescription was skipped',
    example: 'Patient reported nausea after taking the medication',
    required: false,
  })
  @IsString()
  @IsOptional()
  skip_reason_details?: string;
}

// DTO para configuración de recordatorios del paciente
export class UpdatePatientReminderSettingsDto {
  @ApiProperty({
    description: 'Interval between medication reminders in minutes',
    example: 30,
    required: false,
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  medication_reminder_interval_minutes?: number;

  @ApiProperty({
    description: 'Maximum number of reminder retries per dose',
    example: 3,
    required: false,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  medication_reminder_max_retries?: number;
}
