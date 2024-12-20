import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  consultation_reason?: string;

  @IsOptional()
  @IsDate()
  start?: Date;

  @IsOptional()
  @IsDate()
  end?: Date;

  @IsOptional()
  @IsString()
  patient_id?: string;

  @IsOptional()
  @IsString()
  physician_id?: string;

  @IsOptional()
  @IsEnum(['Atendida', 'Cancelada', 'Pendiente'])
  status?: string;

  @IsOptional()
  @IsString()
  cancelation_reason?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  tenant_id?: string;
}
