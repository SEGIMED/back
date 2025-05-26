import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBackgroundDto {
  @ApiProperty({
    description: "Patient's unique identifier",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  patient_id: string;

  @ApiProperty({
    description: 'Vaccination history',
    example: 'BCG, DTP, Polio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  vaccinations: string;

  @ApiProperty({
    description: 'Known allergies',
    example: 'Penicillin, Peanuts',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  allergies: string;

  @ApiProperty({
    description: 'Pathological history',
    example: 'Hypertension since 2010',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  pathological_history: string;

  @ApiProperty({
    description: 'Family medical history',
    example: 'Father with diabetes',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  family_medical_history: string;

  @ApiProperty({
    description: 'Non-pathological history',
    example: 'Smokes 10 cigarettes/day',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  non_pathological_history: string;

  @ApiProperty({
    description: 'Surgical history',
    example: 'Appendectomy in 2005',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  surgical_history: string;

  @ApiProperty({
    description: 'Childhood medical history',
    example: 'Chickenpox at age 5',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  childhood_medical_history: string;

  @ApiProperty({
    description: 'Current medication',
    example: 'Lisinopril 10mg daily',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  current_medication: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tenant_id: string;
}
