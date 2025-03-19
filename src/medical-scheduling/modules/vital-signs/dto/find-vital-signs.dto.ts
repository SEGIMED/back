import { IsUUID, IsNotEmpty } from 'class-validator';

export class FindVitalSignsByPatientDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}

export class FindVitalSignsByEventDto {
  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del evento médico es obligatorio' })
  medical_event_id: string;

  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}

export class FindVitalSignsBySelfEvaluationDto {
  @IsUUID('4', {
    message: 'El ID del evento de autoevaluación debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del evento de autoevaluación es obligatorio' })
  self_evaluation_event_id: string;

  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;
}
