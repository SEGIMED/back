import {
  IsString,
  IsOptional,
  Length,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreatePatientStudyDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  patient_id: string;

  @IsUUID('4', { message: 'El ID del médico debe ser un UUID válido' })
  physician_id: string;

  @IsOptional()
  @IsString({ message: 'La URL debe ser una cadena de texto válida' })
  url?: string;

  @IsString({ message: 'El título debe ser una cadena de texto' })
  @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres' })
  title: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(3, 500, {
    message: 'La descripción debe tener entre 3 y 500 caracteres',
  })
  description: string;
  /* 
  @IsInt({ message: 'El ID del tipo de estudio debe ser un número entero' }) */
  @IsNotEmpty()
  cat_study_type_id: number;

  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id: string;

  @IsBoolean({ message: 'El campo is_deleted debe ser un valor booleano' })
  is_deleted: boolean = false;
}
