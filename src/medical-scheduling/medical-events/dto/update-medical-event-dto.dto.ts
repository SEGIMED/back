import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalEventDto {
  @IsOptional()
  @IsString()
  appointment_id?: string;

  @IsOptional()
  @IsString()
  patient_id?: string;

  @IsOptional()
  @IsString()
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
  @IsString()
  tenant_id?: string;
}
