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

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  consultation_reason: string;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  start: Date;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  end: Date;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @IsEnum(['atendida', 'cancelada', 'pendiente'])
  @IsOptional()
  status?: status_type;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id?: string;
}
