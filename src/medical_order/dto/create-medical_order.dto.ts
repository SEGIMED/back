import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MedicationDto {
  @IsString()
  monodrug: string;

  @IsString()
  dose: string;

  @IsString()
  dose_units: string;

  @IsString()
  frecuency: string;

  @IsString()
  duration: string;

  @IsString()
  duration_units: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsBoolean()
  authorized?: boolean;
}

export class CreateMedicalOrderDto {
  @IsString()
  @IsUUID()
  patient_id: string;

  @IsOptional()
  @IsInt()
  category_cie_diez_id?: number;

  @IsOptional()
  @IsString()
  additional_text?: string;

  @IsOptional()
  @IsDateString()
  application_date?: Date;

  @IsOptional()
  @IsString()
  description_type?: string;

  @IsOptional()
  @IsString()
  url?: string;

  // Campos específicos para autorización de estudios
  @IsOptional()
  @IsInt()
  cat_study_type_id?: number;

  @IsOptional()
  @IsString()
  request_reason?: string;

  // Campos específicos para certificados
  @IsOptional()
  @IsInt()
  cat_certification_type_id?: number;

  // Campos específicos para hospitalización
  @IsOptional()
  @IsString()
  hospitalization_reason?: string;

  // Campos específicos para solicitud de turno
  @IsOptional()
  @IsInt()
  cat_speciality_id?: number;

  // Campos para medicación
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];
}
