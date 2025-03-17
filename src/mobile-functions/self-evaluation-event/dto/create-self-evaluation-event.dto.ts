import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VitalSignDto } from '../../../medical-scheduling/modules/vital-signs/dto/create-vital-sign.dto';

export class CreateSelfEvaluationEventDto {
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
  patient_id: string;

  @IsUUID('4', { message: 'El ID del evento médico debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del evento médico es obligatorio' })
  medical_event_id: string;

  @IsUUID('4', { message: 'El ID del inquilino debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del inquilino es obligatorio' })
  tenant_id: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un signo vital' })
  @ValidateNested({ each: true })
  @Type(() => VitalSignDto)
  vital_signs: VitalSignDto[];
}
