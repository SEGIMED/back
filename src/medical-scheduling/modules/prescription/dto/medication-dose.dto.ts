import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enum para el estado de la dosis
export enum MedicationDoseStatus {
  TAKEN = 'TAKEN',
  MISSED_AUTOMATIC = 'MISSED_AUTOMATIC',
  MISSED_REPORTED = 'MISSED_REPORTED',
  SKIPPED_BY_USER = 'SKIPPED_BY_USER',
}

// DTO para registrar una dosis tomada
export class RecordMedicationDoseDto {
  @ApiProperty({
    description: 'Prescription ID for which the dose is being recorded',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  prescription_id: string;

  @ApiProperty({
    description: 'Status of the medication dose',
    enum: MedicationDoseStatus,
    example: MedicationDoseStatus.TAKEN,
  })
  @IsEnum(MedicationDoseStatus)
  @IsNotEmpty()
  dose_status: MedicationDoseStatus;

  @ApiProperty({
    description: 'Timestamp when the dose was scheduled',
    example: '2025-05-29T08:00:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  scheduled_time: Date;

  @ApiProperty({
    description: 'User ID who is recording the dose',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Timestamp when the dose was actually taken (if taken)',
    example: '2025-05-29T08:05:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actual_taken_time?: Date;

  @ApiProperty({
    description: 'Reference to skip reason catalog if dose was skipped',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  skip_reason_id?: number;

  @ApiProperty({
    description:
      'Additional details about why the dose was skipped (maps to skip_reason_details in table)',
    example: 'Patient reported nausea after taking the medication',
    required: false,
  })
  @IsString()
  @IsOptional()
  skip_reason_details?: string;
}

// DTO para consultar historial de dosis
export class MedicationDoseHistoryQueryDto {
  @ApiProperty({
    description: 'Prescription ID to get dose history for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  prescription_id?: string;

  @ApiProperty({
    description: 'Patient ID to get dose history for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  patient_id?: string;

  @ApiProperty({
    description: 'Start date for dose history query',
    example: '2025-05-01T00:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;

  @ApiProperty({
    description: 'End date for dose history query',
    example: '2025-05-31T23:59:59.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @ApiProperty({
    description: 'Filter by dose status',
    enum: MedicationDoseStatus,
    required: false,
  })
  @IsEnum(MedicationDoseStatus)
  @IsOptional()
  dose_status?: MedicationDoseStatus;

  @ApiProperty({
    description: 'Number of records per page',
    example: 50,
    required: false,
    default: 50,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Page offset for pagination',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  offset?: number;
}

// DTO para respuesta del historial de dosis
export class MedicationDoseLogResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the dose log entry',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'Prescription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  prescription_id: string;

  @ApiProperty({
    description: 'User ID who recorded the dose',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Status of the medication dose',
    enum: MedicationDoseStatus,
  })
  dose_status: MedicationDoseStatus;

  @ApiProperty({
    description: 'Timestamp when the dose was scheduled',
    type: Date,
  })
  scheduled_time: Date;

  @ApiProperty({
    description: 'Timestamp when the dose was actually taken',
    type: Date,
    required: false,
  })
  actual_taken_time?: Date;

  @ApiProperty({
    description: 'Timestamp when the dose was reported',
    type: Date,
  })
  reported_at: Date;

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
    description: 'Additional details about why the dose was skipped',
    required: false,
  })
  skip_reason_details?: string;

  @ApiProperty({
    description: 'Timestamp when the record was created',
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
    type: Date,
  })
  updated_at: Date;
}
