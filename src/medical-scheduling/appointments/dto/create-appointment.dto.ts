import {
  IsUUID,
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { status_type } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Razón o motivo de la consulta',
    example: 'Consulta de control',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  consultation_reason: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la cita (formato ISO)',
    example: '2025-05-23T10:00:00Z',
    type: Date,
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  start: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita (formato ISO)',
    example: '2025-05-23T11:00:00Z',
    type: Date,
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  end: Date;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty({
    description: 'ID del médico',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @ApiProperty({
    description: 'Estado de la cita',
    enum: ['atendida', 'cancelada', 'pendiente'],
    default: 'pendiente',
    required: false,
  })
  @IsEnum(['atendida', 'cancelada', 'pendiente'])
  @IsOptional()
  status?: status_type;

  @ApiProperty({
    description: 'Comentarios adicionales sobre la cita',
    example: 'Paciente con antecedentes de hipertensión',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({
    description: 'ID del tenant al que pertenece la cita',
    example: '123e4567-e89b-12d3-a456-426614174002',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id?: string;
}
