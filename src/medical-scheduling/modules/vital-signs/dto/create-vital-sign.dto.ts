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
import { ApiProperty } from '@nestjs/swagger';

export class VitalSignDto {
  @ApiProperty({
    description:
      'Identifier of the vital sign type (e.g., heart rate, temperature)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El ID del signo vital es obligatorio' })
  vital_sign_id: number;

  @ApiProperty({
    description: 'Measured value of the vital sign',
    example: 98.6,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'La medida es obligatoria' })
  measure: number;
}

export class CreateVitalSignDto {
  @ApiProperty({
    description: "Patient's unique identifier",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @ApiProperty({
    description:
      "Tenant's unique identifier (optional, taken from token if not provided)",
    example: 'tid_12345',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id?: string;

  @ApiProperty({
    description: 'Optional medical event ID associated with these vital signs',
    example: 'abcdef01-2345-6789-abcd-ef0123456789',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  medical_event_id?: string;

  @ApiProperty({
    description:
      'Optional self-evaluation event ID associated with these vital signs',
    example: 'fedcba98-7654-3210-fedc-ba9876543210',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El ID del evento de autoevaluación debe ser un UUID válido',
  })
  self_evaluation_event_id?: string;

  @ApiProperty({
    description: 'Array of vital signs to be recorded',
    type: () => [VitalSignDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => VitalSignDto)
  vital_signs: VitalSignDto[];
}

export class CreateMultipleVitalSignsDto {
  @ApiProperty({
    description:
      'Array of vital sign creation requests for multiple patients or instances',
    type: () => [CreateVitalSignDto],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => CreateVitalSignDto)
  vital_signs: CreateVitalSignDto[];
}
