import { IsOptional, IsString, IsDate, IsEnum, IsUUID } from 'class-validator';

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
  @IsUUID()
  patient_id?: string;

  @IsOptional()
  @IsUUID()
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
  @IsUUID()
  tenant_id?: string;
}
