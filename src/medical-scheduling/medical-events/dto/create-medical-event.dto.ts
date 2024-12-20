import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalEventDto {
  @IsNotEmpty()
  @IsString()
  appointment_id: string;

  @IsNotEmpty()
  @IsString()
  patient_id: string;

  @IsNotEmpty()
  @IsString()
  physician_id: string;

  @IsOptional()
  @IsString()
  physician_comments?: string;

  @IsNotEmpty()
  @IsString()
  main_diagnostic_cie: string;

  @IsOptional()
  @IsString()
  evolution?: string;

  @IsOptional()
  @IsString()
  procedure?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsNotEmpty()
  @IsString()
  tenant_id: string;
}
