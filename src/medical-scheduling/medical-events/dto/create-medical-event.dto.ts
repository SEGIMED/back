import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMedicalEventDto {
  @IsUUID()
  @IsNotEmpty()
  appointment_id: string;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @IsString()
  @IsOptional()
  physician_comments?: string;

  @IsString()
  @IsOptional()
  main_diagnostic_cie?: string;

  @IsString()
  @IsOptional()
  evolution?: string;

  @IsString()
  @IsOptional()
  procedure?: string;

  @IsString()
  @IsOptional()
  treatment?: string;
}
