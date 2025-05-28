import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalEventDto {
  @ApiProperty({
    description: 'The ID of the appointment related to this medical event',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  appointment_id: string;

  @ApiProperty({
    description: 'The ID of the patient involved in this medical event',
    example: 'b2c3d4e5-f6g7-8901-2345-67890abcdef0',
  })
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty({
    description: 'The ID of the physician attending this medical event',
    example: 'c3d4e5f6-g7h8-9012-3456-7890abcdef01',
  })
  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @ApiProperty({
    description: 'Optional comments from the physician',
    example: 'Patient reports feeling better after medication.',
    required: false,
  })
  @IsString()
  @IsOptional()
  physician_comments?: string;

  @ApiProperty({
    description: 'Optional main diagnostic CIE code',
    example: 'A001',
    required: false,
  })
  @IsString()
  @IsOptional()
  main_diagnostic_cie?: string;

  @ApiProperty({
    description: 'Optional description of the patient_s evolution',
    example: 'Steady improvement over the last 24 hours.',
    required: false,
  })
  @IsString()
  @IsOptional()
  evolution?: string;

  @ApiProperty({
    description: 'Optional description of any procedures performed',
    example: 'Minor suture applied to laceration.',
    required: false,
  })
  @IsString()
  @IsOptional()
  procedure?: string;

  @ApiProperty({
    description: 'Optional description of the treatment provided',
    example: 'Prescribed Amoxicillin 500mg every 8 hours for 7 days.',
    required: false,
  })
  @IsString()
  @IsOptional()
  treatment?: string;
}
