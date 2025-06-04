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

// Enum para el estado de la dosis (específico para mobile)
export enum MobileMedicationDoseStatus {
  TAKEN = 'TAKEN',
  MISSED_REPORTED = 'MISSED_REPORTED',
  SKIPPED_BY_USER = 'SKIPPED_BY_USER',
}

// DTO para crear un nuevo registro de dosis desde mobile
export class CreateMedicationDoseLogDto {
  @ApiProperty({
    description: 'Prescription ID for which the dose is being recorded',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  prescription_id: string;

  @ApiProperty({
    description:
      'Timestamp when the dose was scheduled (can be inferred or sent)',
    example: '2025-05-29T08:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduled_time?: Date;

  @ApiProperty({
    description:
      'Timestamp when the dose was actually taken (required if status is TAKEN)',
    example: '2025-05-29T08:05:00.000Z',
    type: Date,
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  actual_taken_time?: Date;

  @ApiProperty({
    description: 'Status of the medication dose',
    enum: MobileMedicationDoseStatus,
    example: MobileMedicationDoseStatus.TAKEN,
  })
  @IsEnum(MobileMedicationDoseStatus)
  @IsNotEmpty()
  status: MobileMedicationDoseStatus;
}

// DTO para marcar dosis como omitida por usuario
export class SkipMedicationDoseDto {
  @ApiProperty({
    description: 'Reference to skip reason catalog',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  skip_reason_id: number;

  @ApiProperty({
    description: 'Additional details about why the dose was skipped',
    example: 'Patient reported nausea after taking the medication',
    required: false,
  })
  @IsString()
  @IsOptional()
  skip_reason_details?: string;
}

// DTO para ajustar el tiempo de toma de dosis
export class AdjustDoseTimeDto {
  @ApiProperty({
    description: 'New actual taken time for the dose',
    example: '2025-05-29T08:30:00.000Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  actual_taken_time: Date;
}

// DTO para respuesta del log de dosis
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
    example: 'TAKEN',
  })
  status: string;

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
