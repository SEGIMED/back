import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

// DTO para POST /mobile/prescriptions/self-assigned
export class CreateSelfAssignedPrescriptionDto {
  @ApiProperty({
    description: 'Name of the medication/monodrug',
    example: 'Paracetamol 500mg',
  })
  @IsString()
  @IsNotEmpty()
  monodrug: string;

  @ApiProperty({
    description: 'Dosage of the medication',
    example: '1',
    required: false,
    default: '1',
  })
  @IsString()
  @IsOptional()
  dose?: string;

  @ApiProperty({
    description: 'Units for the dose (e.g., comprimido, ml, cucharada)',
    example: 'comprimido',
    required: false,
    default: 'comprimido',
  })
  @IsString()
  @IsOptional()
  dose_units?: string;

  @ApiProperty({
    description:
      'Frequency of the medication (e.g., daily, twice_daily, every_8_hours)',
    example: 'daily',
    required: false,
    default: 'daily',
  })
  @IsString()
  @IsOptional()
  frecuency?: string;

  @ApiProperty({
    description: 'Duration of the treatment',
    example: '30',
    required: false,
    default: '30',
  })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({
    description: 'Units for the duration (e.g., días, semanas, meses)',
    example: 'días',
    required: false,
    default: 'días',
  })
  @IsString()
  @IsOptional()
  duration_units?: string;

  @ApiProperty({
    description: 'Additional observations or notes about the medication',
    example: 'Medicamento auto-asignado para dolor de cabeza ocasional',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({
    description: 'Enable tracking for this medication immediately',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  enable_tracking?: boolean;

  @ApiProperty({
    description: 'Enable reminders for this medication',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  enable_reminders?: boolean;

  @ApiProperty({
    description: 'Preferred time slots for taking medication (HH:MM format)',
    example: ['08:00', '20:00'],
    required: false,
    type: [String],
  })
  @IsOptional()
  time_of_day_slots?: string[];
}

// DTO para respuesta del endpoint self-assigned
export class SelfAssignedPrescriptionResponseDto {
  @ApiProperty({
    description: 'Created prescription ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  prescription_id: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Medicamento auto-asignado creado exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Whether tracking was enabled',
    example: true,
  })
  tracking_enabled: boolean;

  @ApiProperty({
    description: 'Whether reminders were enabled',
    example: true,
  })
  reminders_enabled: boolean;

  @ApiProperty({
    description: 'Prescription details',
  })
  prescription: {
    id: string;
    monodrug: string;
    dose: string;
    dose_units: string;
    frecuency: string;
    duration: string;
    duration_units: string;
    observations?: string;
    created_by_patient: boolean;
    is_tracking_active: boolean;
    reminder_enabled: boolean;
    time_of_day_slots?: string[];
  };
}
