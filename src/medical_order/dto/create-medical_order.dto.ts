import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  ValidateNested,
  IsArray,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MedicationDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the medicine monodrug',
    example: 'Paracetamol',
  })
  monodrug: string;

  @IsString()
  @ApiProperty({
    description: 'Dose amount',
    example: '500',
  })
  dose: string;

  @IsString()
  @ApiProperty({
    description: 'Units for the dose',
    example: 'mg',
  })
  dose_units: string;

  @IsString()
  @ApiProperty({
    description: 'Frequency of administration',
    example: 'Every 8 hours',
  })
  frecuency: string;

  @IsString()
  @ApiProperty({
    description: 'Duration of treatment',
    example: '7',
  })
  duration: string;

  @IsString()
  @ApiProperty({
    description: 'Units for the duration',
    example: 'days',
  })
  duration_units: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Additional observations about the medication',
    example: 'Take with food',
  })
  observations?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Indicates if the medication is authorized',
    example: true,
  })
  authorized?: boolean;
}

export class CreateMedicalOrderDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'UUID of the patient',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  patient_id: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of the CIE10 diagnosis category',
    example: 123,
  })
  category_cie_diez_id?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Additional text for the medical order',
    example: 'Patient needs to follow a strict diet',
  })
  additional_text?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Date when the order should be applied',
    example: '2025-05-20T12:00:00Z',
  })
  application_date?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Description of the order type',
    example: 'Prescription',
  })
  description_type?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'URL to any related document or resource',
    example: 'https://example.com/resources/123',
  })
  url?: string;

  // Campos específicos para autorización de estudios
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of the study type category',
    example: 456,
  })
  cat_study_type_id?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Reason for the request',
    example: 'Monitoring chronic condition',
  })
  request_reason?: string;

  // Campos específicos para certificados
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of certification type category',
    example: 789,
  })
  cat_certification_type_id?: number;

  // Campos específicos para hospitalización
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Reason for hospitalization',
    example: 'Severe dehydration requiring IV fluids',
  })
  hospitalization_reason?: string;

  // Campos específicos para solicitud de turno
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of medical specialty category',
    example: 101,
  })
  cat_speciality_id?: number;

  // Campos para medicación
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  @ApiPropertyOptional({
    description: 'List of medications prescribed',
    type: [MedicationDto],
  })
  medications?: MedicationDto[];

  // Campo para archivo base64
  @IsOptional()
  @IsString({ message: 'El archivo en base64 debe ser una cadena de texto' })
  @Matches(/^data:(image\/[^;]+|application\/pdf);base64,/, {
    message:
      'El formato del archivo base64 no es válido. Debe ser un DATA URI válido (data:mimetype;base64,)',
  })
  @ApiPropertyOptional({
    description: 'Base64 encoded file (image or PDF)',
    example: 'data:application/pdf;base64,JVBERi0xLjYNJeLjz9...',
  })
  file?: string;
}
