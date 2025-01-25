import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';

export class physicalExaminationDto {
  @IsUUID(undefined, { message: 'ID debe ser un UUID válido' })
  @IsOptional()
  id?: string;

  @IsUUID(undefined, {
    message: 'El ID del subsistema físico debe ser un UUID válido',
  })
  @IsOptional()
  physical_subsystem_id?: string;

  @IsUUID(undefined, { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente no puede estar vacío' })
  patient_id: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  description: string;

  @IsUUID(undefined, {
    message: 'El ID del evento médico debe ser un UUID válido',
  })
  @IsNotEmpty({ message: 'El ID del evento médico no puede estar vacío' })
  medical_event_id: string;

  @IsUUID(undefined, { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino no puede estar vacío' })
  tenant_id: string;

  @IsDate({ message: 'La fecha de creación debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de creación no puede estar vacía' })
  createdAt: Date;

  @IsDate({ message: 'La fecha de actualización debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de actualización no puede estar vacía' })
  updatedAt: Date;
}
