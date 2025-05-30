import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';

// DTO para PATCH /mobile/prescriptions/:prescription_id/activate-tracking
export class ActivateTrackingDto {
  @ApiProperty({
    description: 'Enable medication tracking',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_tracking_active?: boolean;

  @ApiProperty({
    description: 'Enable medication reminders',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  reminder_enabled?: boolean;

  @ApiProperty({
    description: 'Preferred time slots for taking medication (HH:MM format)',
    example: ['08:00', '14:00', '20:00'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  time_of_day_slots?: string[];

  @ApiProperty({
    description: 'Date when tracking should start (YYYY-MM-DD format)',
    example: '2025-05-30',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  tracking_start_date?: string;

  @ApiProperty({
    description: 'Additional notes about tracking activation',
    example: 'Patient wants to track adherence for better management',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO para respuesta de activate-tracking
export class ActivateTrackingResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Seguimiento de medicación activado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Prescription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  prescription_id: string;

  @ApiProperty({
    description: 'Whether tracking is now active',
    example: true,
  })
  is_tracking_active: boolean;

  @ApiProperty({
    description: 'Whether reminders are enabled',
    example: true,
  })
  reminder_enabled: boolean;

  @ApiProperty({
    description: 'Configured time slots',
    example: ['08:00', '14:00', '20:00'],
    type: [String],
  })
  time_of_day_slots: string[];

  @ApiProperty({
    description: 'Date when tracking started',
    example: '2025-05-30',
  })
  tracking_start_date: string;

  @ApiProperty({
    description: 'Next scheduled dose time',
    example: '2025-05-30T08:00:00.000Z',
    required: false,
  })
  next_dose_time?: string;
}
