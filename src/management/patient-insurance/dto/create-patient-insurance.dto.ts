import { ApiProperty } from '@nestjs/swagger';
import { insurance_status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePatientInsuranceDto {
  @ApiProperty({
    description: 'El ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  patient_id: string;
  
  @ApiProperty({
    description: 'El nombre de la aseguradora',
    example: 'Seguros ABC',
  })
  @IsString()
  @IsNotEmpty()
  insurance_provider: string;

  @ApiProperty({
    description: 'El número de la aseguradora',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  insurance_number: string;

  @ApiProperty({
    description: 'El estado de la aseguradora',
    example: insurance_status.active,
  })
  @IsEnum(insurance_status)
  @IsNotEmpty()
  insurance_status: insurance_status;
}
