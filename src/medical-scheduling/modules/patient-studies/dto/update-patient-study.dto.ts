import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientStudyDto } from './create-patient-study.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePatientStudyDto extends PartialType(CreatePatientStudyDto) {
  @ApiProperty({
    description: 'The type of study performed',
    example: 'X-Ray',
    required: false,
  })
  @IsOptional()
  @IsString()
  study_type?: string;

  @ApiProperty({
    description: 'The date the study was performed',
    example: '2024-07-16T11:00:00.000Z',
    type: String,
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsString() // Assuming date is handled as string, adjust if it's a Date object
  study_date?: string;

  @ApiProperty({
    description: 'The institution where the study was performed',
    example: 'City Clinic',
    required: false,
  })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiProperty({
    description: 'The URL or path to the study file',
    example: 'https://example.com/xray.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  study_file?: string;

  @IsOptional()
  @IsString({ message: 'El archivo en base64 debe ser una cadena de texto' })
  @Matches(/^data:(image\/[^;]+|application\/pdf);base64,/, {
    message:
      'El formato del archivo base64 no es válido. Debe ser un DATA URI válido (data:mimetype;base64,)',
  })
  file?: string;
}
