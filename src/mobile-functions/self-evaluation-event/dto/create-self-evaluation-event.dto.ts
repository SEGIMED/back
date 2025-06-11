import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VitalSignDto } from '../../../medical-scheduling/modules/vital-signs/dto/create-vital-sign.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSelfEvaluationEventDto {
  @ApiProperty({
    description: 'ID del paciente que realiza la autoevaluación',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @ApiProperty({
    description: 'ID del evento médico asociado a esta autoevaluación',
    example: 'abcdef01-2345-6789-abcd-ef0123456789',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del evento médico es obligatorio' })
  medical_event_id: string;

  @ApiProperty({
    description:
      'ID del inquilino (tenant) en el sistema (opcional para signos vitales propios del paciente)',
    example: 'tid_12345-6789-abcd-ef0123456789',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  tenant_id?: string;

  @ApiProperty({
    description: 'Array de signos vitales registrados en la autoevaluación',
    type: [VitalSignDto],
    example: [
      { vital_sign_id: 1, measure: 98.6 }, // Temperatura en °F
      { vital_sign_id: 2, measure: 120 }, // Presión sistólica
    ],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => VitalSignDto)
  vital_signs: VitalSignDto[];
}

// DTO simplificado para autoevaluaciones móviles (solo signos vitales propios)
export class CreateMobileSelfEvaluationDto {
  @ApiProperty({
    description: 'Array de signos vitales registrados por el paciente',
    type: [VitalSignDto],
    example: [
      { vital_sign_id: 1, measure: 36.5 }, // Temperatura corporal en °C
      { vital_sign_id: 2, measure: 120 }, // Presión sistólica en mmHg
      { vital_sign_id: 3, measure: 80 }, // Presión diastólica en mmHg
      { vital_sign_id: 4, measure: 75 }, // Frecuencia cardíaca en bpm
    ],
  })
  @IsArray({ message: 'vital_signs debe ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => VitalSignDto)
  vital_signs: VitalSignDto[];
}
