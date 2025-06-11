import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Start date and time of the prescription',
    example: '2025-05-22T10:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date) // Add Type decorator
  @IsOptional()
  start_timestamp?: Date;

  @ApiProperty({
    description: 'End date and time of the prescription',
    example: '2025-06-22T10:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date) // Add Type decorator
  @IsOptional()
  end_timestamp?: Date;

  @ApiProperty({
    description: 'Detailed description or instructions for the prescription',
    example: 'Take one tablet daily with food.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the prescription is currently active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: "Patient's unique identifier",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false, // Assuming this can be linked via medical_order_id as well or is context-dependent
  })
  @IsString()
  @IsOptional()
  patient_id?: string;

  @ApiProperty({
    description: 'Name or identifier of the monodrug prescribed',
    example: 'Amoxicillin 500mg',
  })
  @IsString()
  monodrug: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
    format: 'uuid',
    required: false, // Assuming this is often derived from the authenticated user/header
  })
  @IsString()
  @IsOptional()
  tenant_id?: string;

  // New medication tracking fields
  @ApiProperty({
    description:
      'Indicates if this prescription was created by the patient (patient-initiated tracking)',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  created_by_patient?: boolean;

  @ApiProperty({
    description:
      'Indicates if medication tracking is currently active for this prescription',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_tracking_active?: boolean;

  @ApiProperty({
    description:
      'Indicates if medication reminders are enabled for this prescription',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  reminder_enabled?: boolean;

  @ApiProperty({
    description:
      'Timestamp when the first dose was taken (if tracking has started)',
    example: '2025-05-29T08:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  first_dose_taken_at?: Date;

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
    description: 'Timestamp of the last reminder sent',
    example: '2025-05-29T08:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  last_reminder_sent_at?: Date;

  @ApiProperty({
    description: 'Count of reminders sent for this prescription',
    example: 5,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  reminders_sent_count?: number;

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

  // Missing fields from prescription table
  @ApiProperty({
    description: 'Whether prescription shows in patient calendar',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  show_in_calendar?: boolean;

  @ApiProperty({
    description: 'Whether prescription is authorized by physician',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  authorized?: boolean;

  @ApiProperty({
    description: 'Whether patient has stopped the treatment',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  patient_stopped_treatment?: boolean;

  @ApiProperty({
    description: 'Date when patient stopped the treatment',
    example: '2025-05-29T10:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  patient_stopped_treatment_date?: Date;

  @ApiProperty({
    description: 'Reason why patient stopped the treatment',
    example: 'Side effects were too severe',
    required: false,
  })
  @IsString()
  @IsOptional()
  patient_stopped_treatment_reason?: string;
}
