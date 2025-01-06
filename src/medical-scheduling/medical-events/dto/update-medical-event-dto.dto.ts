import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMedicalEventDto {
  @IsOptional()
  @IsUUID()
  appointment_id?: string;

  @IsOptional()
  @IsUUID()
  patient_id?: string;

  @IsOptional()
  @IsUUID()
  physician_id?: string;

  @IsOptional()
  @IsString()
  physician_comments?: string;

  @IsOptional()
  @IsString()
  main_diagnostic_cie?: string;

  @IsOptional()
  @IsString()
  evolution?: string;

  @IsOptional()
  @IsString()
  procedure?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsUUID()
  tenant_id?: string;
}
