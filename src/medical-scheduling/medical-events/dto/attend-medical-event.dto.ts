import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VitalSignItemDto {
  @ApiProperty({ description: 'ID of the vital sign', example: 1 })
  @IsInt()
  @IsNotEmpty()
  vital_sign_id: number;

  @ApiProperty({ description: 'Measurement of the vital sign', example: 98 })
  @IsInt()
  @IsNotEmpty()
  measure: number;
}

export class PhysicalExplorationItemDto {
  @ApiProperty({
    description: 'ID of the physical exploration area',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  physical_exploration_area_id: number;

  @ApiProperty({
    description: 'Description of the physical exploration',
    example: 'No abnormalities found',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class PhysicalExaminationItemDto {
  @ApiProperty({
    description: 'ID of the physical subsystem (optional)',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  physical_subsystem_id?: number;

  @ApiProperty({
    description: 'Description of the physical examination',
    example: 'Lungs clear to auscultation',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class MedicationItemDto {
  @ApiProperty({ description: 'Monodrug name', example: 'Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  monodrug: string;

  @ApiProperty({ description: 'Dosage of the medication', example: '500' })
  @IsString()
  @IsNotEmpty()
  dose: string;

  @ApiProperty({ description: 'Units for the dosage', example: 'mg' })
  @IsString()
  @IsNotEmpty()
  dose_units: string;

  @ApiProperty({
    description: 'Frequency of administration',
    example: 'Every 8 hours',
  })
  @IsString()
  @IsNotEmpty()
  frecuency: string;

  @ApiProperty({ description: 'Duration of the treatment', example: '7' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ description: 'Units for the duration', example: 'days' })
  @IsString()
  @IsNotEmpty()
  duration_units: string;

  @ApiProperty({
    description: 'Additional observations for the medication (optional)',
    example: 'Take with food',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class AttendMedicalEventDto {
  @ApiProperty({
    description: 'ID of the medical event to attend',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Optional comments from the physician',
    example: 'Patient is recovering well.',
    required: false,
  })
  @IsString()
  @IsOptional()
  physician_comments?: string;

  @ApiProperty({
    description: 'Optional main diagnostic CIE code',
    example: 'J00',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  main_diagnostic_cie_id?: number;

  @ApiProperty({
    description: 'Optional description of the patient_s evolution',
    example: 'Symptoms have subsided.',
    required: false,
  })
  @IsString()
  @IsOptional()
  evolution?: string;

  @ApiProperty({
    description: 'Optional description of any procedures performed',
    example: 'Blood sample taken for analysis.',
    required: false,
  })
  @IsString()
  @IsOptional()
  procedure?: string;

  @ApiProperty({
    description: 'Optional description of the treatment provided',
    example: 'Continue current medication.',
    required: false,
  })
  @IsString()
  @IsOptional()
  treatment?: string;

  @ApiProperty({
    type: () => [VitalSignItemDto],
    description: 'Optional list of vital signs recorded',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VitalSignItemDto)
  @IsOptional()
  vital_signs?: VitalSignItemDto[];

  @ApiProperty({
    type: [Number],
    description: 'Optional list of subcategory CIE IDs',
    example: [101, 102],
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  subcategory_cie_ids?: number[];

  @ApiProperty({
    type: () => [PhysicalExplorationItemDto],
    description: 'Optional list of physical explorations',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhysicalExplorationItemDto)
  @IsOptional()
  physical_explorations?: PhysicalExplorationItemDto[];

  @ApiProperty({
    type: () => [PhysicalExaminationItemDto],
    description: 'Optional list of physical examinations',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhysicalExaminationItemDto)
  @IsOptional()
  physical_examinations?: PhysicalExaminationItemDto[];

  @ApiProperty({
    type: () => [MedicationItemDto],
    description: 'Optional list of prescribed medications',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  @IsOptional()
  medications?: MedicationItemDto[];

  @ApiProperty({
    description: 'Optional flag indicating if the consultation has ended',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  consultation_ended?: boolean;
}
