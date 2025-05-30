import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
} from 'class-validator';

// DTO para PATCH /mobile/prescriptions/:prescription_id/toggle-reminder
export class ToggleReminderDto {
  @ApiProperty({
    description: 'Enable or disable medication reminders',
    example: true,
  })
  @IsBoolean()
  reminder_enabled: boolean;

  @ApiProperty({
    description: 'Interval between reminders in minutes',
    example: 30,
    required: false,
    default: 30,
    minimum: 5,
    maximum: 120,
  })
  @IsNumber()
  @Min(5)
  @Max(120)
  @IsOptional()
  reminder_interval_minutes?: number;

  @ApiProperty({
    description: 'Maximum number of reminder attempts per dose',
    example: 3,
    required: false,
    default: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  max_reminder_attempts?: number;

  @ApiProperty({
    description: 'Custom reminder message',
    example: 'Es hora de tomar tu medicamento',
    required: false,
  })
  @IsString()
  @IsOptional()
  custom_reminder_message?: string;

  @ApiProperty({
    description: 'Enable sound for reminders',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sound_enabled?: boolean;

  @ApiProperty({
    description: 'Enable vibration for reminders',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  vibration_enabled?: boolean;
}

// DTO para respuesta de toggle-reminder
export class ToggleReminderResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Configuración de recordatorios actualizada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Prescription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  prescription_id: string;

  @ApiProperty({
    description: 'Whether reminders are now enabled',
    example: true,
  })
  reminder_enabled: boolean;

  @ApiProperty({
    description: 'Interval between reminders in minutes',
    example: 30,
  })
  reminder_interval_minutes: number;

  @ApiProperty({
    description: 'Maximum number of reminder attempts per dose',
    example: 3,
  })
  max_reminder_attempts: number;

  @ApiProperty({
    description: 'Custom reminder message if set',
    example: 'Es hora de tomar tu medicamento',
    required: false,
  })
  custom_reminder_message?: string;

  @ApiProperty({
    description: 'Sound enabled for reminders',
    example: true,
  })
  sound_enabled: boolean;

  @ApiProperty({
    description: 'Vibration enabled for reminders',
    example: true,
  })
  vibration_enabled: boolean;

  @ApiProperty({
    description: 'Next reminder time if applicable',
    example: '2025-05-30T08:00:00.000Z',
    required: false,
  })
  next_reminder_time?: string;
}
