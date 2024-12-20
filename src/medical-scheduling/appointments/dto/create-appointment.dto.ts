import { status_type } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  consultation_reason: string;

  @IsNotEmpty()
  @IsDate()
  start: Date;

  @IsNotEmpty()
  @IsDate()
  end: Date;

  @IsNotEmpty()
  @IsString()
  patient_id: string;

  @IsNotEmpty()
  @IsString()
  physician_id: string;

  @IsNotEmpty()
  @IsEnum(['Atendida', 'Cancelada', 'Pendiente'])
  status: status_type;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsNotEmpty()
  @IsString()
  tenant_id: string;
}
