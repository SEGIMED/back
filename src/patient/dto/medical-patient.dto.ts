import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { CreatePatientDto } from './create-patient.dto';
import { BaseUserDto } from 'src/user/dto/create-user.dto';

export class MedicalPatientDto {
  @ValidateNested()
  @Type(() => BaseUserDto)
  @IsNotEmpty({ message: 'El objeto user no puede estar vacío' })
  user: Omit<BaseUserDto, 'role' | 'password'>;

  @ValidateNested()
  @Type(() => CreatePatientDto)
  @IsNotEmpty({ message: 'El objeto patient no puede estar vacío' })
  patient: CreatePatientDto;
}
