import {
  IsUUID,
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { status_type } from '@prisma/client';
import { Transform } from 'class-transformer';

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

  @IsEnum(['Atendida', 'Cancelada', 'Pendiente'])
  @IsOptional()
  status?: status_type;

  @IsString()
  @IsOptional()
  comments?: string;

  // @IsUUID()
  // @IsNotEmpty()
  // tenant_id: string;
}
