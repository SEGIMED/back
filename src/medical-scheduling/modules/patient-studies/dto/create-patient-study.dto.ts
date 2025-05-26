import {
  IsString,
  IsOptional,
  Length,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  Matches,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientStudyDto {
  @ApiProperty({
    description: 'The ID of the medical event associated with this study',
    example: 'clx0k2q00000008l0e1g2h3i4',
  })
  @IsNotEmpty()
  @IsString()
  medicalEventId: string;

  @ApiProperty({
    description: 'The type of study performed',
    example: 'Blood Test',
  })
  @IsNotEmpty()
  @IsString()
  study_type: string;

  @ApiProperty({
    description: 'The date the study was performed',
    example: '2024-07-15T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsString() // Assuming date is handled as string, adjust if it's a Date object
  study_date: string;

  @ApiProperty({
    description: 'The institution where the study was performed',
    example: 'General Hospital',
    required: false,
  })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiProperty({
    description: 'The URL or path to the study file',
    example: 'https://example.com/study.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  study_file?: string;

  @ApiProperty({
    description: 'The ID of the user who created the study record',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

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

  @IsBoolean({ message: 'El campo is_deleted debe ser un valor booleano' })
  is_deleted: boolean = false;

  @IsOptional()
  @IsString({ message: 'El archivo en base64 debe ser una cadena de texto' })
  @Matches(/^data:(image\/[^;]+|application\/pdf);base64,/, {
    message:
      'El formato del archivo base64 no es válido. Debe ser un DATA URI válido (data:mimetype;base64,)',
  })
  file?: string;
}
