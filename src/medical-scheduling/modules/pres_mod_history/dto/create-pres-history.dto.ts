import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePresHistoryDto {
  // Prescription - information
  @ApiProperty({
    description: 'Fecha de inicio de la prescripción',
    type: Date,
    required: false,
    example: '2025-05-01T10:30:00.000Z',
  })
  @IsDate()
  @IsOptional()
  start_timestamp?: Date;

  @ApiProperty({
    description: 'Fecha de finalización de la prescripción',
    type: Date,
    required: false,
    example: '2025-06-01T10:30:00.000Z',
  })
  @IsDate()
  @IsOptional()
  end_timestamp?: Date;

  @ApiProperty({
    description: 'Descripción de la prescripción',
    type: String,
    required: false,
    example: 'Tratamiento para hipertensión',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indica si la prescripción está activa',
    type: Boolean,
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'ID del paciente',
    type: String,
    required: false,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  patient_id?: string;

  @ApiProperty({
    description: 'Monofármaco prescrito',
    type: String,
    required: false,
    example: 'Paracetamol',
  })
  @IsString()
  @IsOptional()
  monodrug?: string;

  @ApiProperty({
    description: 'ID del tenant',
    type: String,
    required: false,
    format: 'uuid',
    example: 'tid_12345-6789-abcd-ef0123456789',
  })
  @IsString()
  @IsOptional()
  tenant_id?: string;

  // Prescription modification History

  @ApiProperty({
    description: 'ID de la prescripción modificada',
    type: String,
    required: true,
    format: 'uuid',
    example: 'abcdef01-2345-6789-abcd-ef0123456789',
  })
  @IsString()
  @IsOptional()
  prescription_id: string;

  @ApiProperty({
    description: 'ID del médico que realizó la modificación',
    type: String,
    required: true,
    format: 'uuid',
    example: 'fedcba98-7654-3210-fedc-ba9876543210',
  })
  @IsString()
  @IsOptional()
  physician_id: string;

  @ApiProperty({
    description: 'Fecha y hora de la modificación',
    type: Date,
    required: true,
    example: '2025-05-22T14:30:00.000Z',
  })
  @IsDate()
  @IsOptional()
  mod_timestamp: Date;

  @ApiProperty({
    description: 'ID del evento médico asociado',
    type: String,
    required: false,
    format: 'uuid',
    example: '456abcde-f789-0123-4567-89abcdef0123',
  })
  @IsOptional()
  medical_event_id?: string;

  // @IsOptional()
  // medical_order_id:string?

  @ApiProperty({
    description: 'Observaciones sobre la modificación',
    type: String,
    required: false,
    example: 'Se ajustó la dosis debido a efectos secundarios',
  })
  @IsOptional()
  observations?: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    type: String,
    required: true,
    example: '500',
  })
  @IsString()
  dose: string;

  @ApiProperty({
    description: 'Unidades de la dosis (mg, ml, etc.)',
    type: String,
    required: true,
    example: 'mg',
  })
  @IsString()
  dose_units: string;

  @ApiProperty({
    description: 'Frecuencia de administración',
    type: String,
    required: true,
    example: 'Cada 8 horas',
  })
  @IsString()
  frecuency: string;

  @ApiProperty({
    description: 'Duración del tratamiento',
    type: String,
    required: true,
    example: '7',
  })
  @IsString()
  duration: string;
  @ApiProperty({
    description: 'Unidades de duración (días, semanas, etc.)',
    type: String,
    required: true,
    example: 'días',
  })
  @IsString()
  duration_units: string;

  @ApiProperty({
    description: 'Nombre comercial del medicamento',
    type: String,
    required: false,
    example: 'Tylenol',
  })
  @IsString()
  @IsOptional()
  commercial_name?: string;
}
