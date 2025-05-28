import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer'; // Import Type

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Start date and time of the prescription',
    example: '2025-05-22T10:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date) // Add Type decorator
  @IsOptional()
  start_timestamp?: Date;

  @ApiProperty({
    description: 'End date and time of the prescription',
    example: '2025-06-22T10:00:00.000Z',
    required: false,
    type: Date,
  })
  @IsDate()
  @Type(() => Date) // Add Type decorator
  @IsOptional()
  end_timestamp?: Date;

  @ApiProperty({
    description: 'Detailed description or instructions for the prescription',
    example: 'Take one tablet daily with food.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the prescription is currently active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: "Patient's unique identifier",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false, // Assuming this can be linked via medical_order_id as well or is context-dependent
  })
  @IsString()
  @IsOptional()
  patient_id?: string;

  @ApiProperty({
    description: 'Name or identifier of the monodrug prescribed',
    example: 'Amoxicillin 500mg',
  })
  @IsString()
  monodrug: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
    format: 'uuid',
    required: false, // Assuming this is often derived from the authenticated user/header
  })
  @IsString()
  @IsOptional()
  tenant_id?: string;
}
