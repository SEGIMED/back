import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class FindVitalSignsByPatientDto {
  @ApiProperty({
    description: "Patient's unique identifier",
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}

export class FindVitalSignsByEventDto {
  @ApiProperty({
    description: 'Medical event unique identifier',
    example: 'abcdef01-2345-6789-abcd-ef0123456789',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del evento médico es obligatorio' })
  medical_event_id: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}

export class FindVitalSignsBySelfEvaluationDto {
  @ApiProperty({
    description: 'Self-evaluation event unique identifier',
    example: 'fedcba98-7654-3210-fedc-ba9876543210',
    format: 'uuid',
  })
  @IsUUID('4', {
    message: 'El ID del evento de autoevaluación debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del evento de autoevaluación es obligatorio' })
  self_evaluation_event_id: string;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_12345',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}
