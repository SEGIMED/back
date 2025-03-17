import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VitalSignDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del signo vital es obligatorio' })
  vital_sign_id: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La medida es obligatoria' })
  measure: number;
}

export class CreateVitalSignDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  medical_event_id?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El ID del evento de autoevaluación debe ser un UUID válido',
  })
  self_evaluation_event_id?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => VitalSignDto)
  vital_signs: VitalSignDto[];
}

export class CreateMultipleVitalSignsDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => CreateVitalSignDto)
  vital_signs: CreateVitalSignDto[];
}
