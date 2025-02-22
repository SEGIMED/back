import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBackgroundDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  patient_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  vaccinations: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  allergies: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  pathological_history: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  family_medical_history: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  non_pathological_history: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  surgical_history: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  childhood_medical_history: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  current_medication: string;
}
