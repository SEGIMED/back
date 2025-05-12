import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreatePatientDto } from './create-patient.dto';
import { BaseUserDto } from 'src/management/user/dto/create-user.dto';

export class MedicalPatientDto {
  @ApiProperty({
    description: 'User information for the patient',
    type: () => BaseUserDto,
  })
  @ValidateNested()
  @Type(() => BaseUserDto)
  @IsNotEmpty({ message: 'El objeto user no puede estar vacío' })
  user: Omit<BaseUserDto, 'role' | 'password'>;

  @ApiProperty({
    description: 'Patient specific information',
    type: () => CreatePatientDto,
  })
  @ValidateNested()
  @Type(() => CreatePatientDto)
  @IsNotEmpty({ message: 'El objeto patient no puede estar vacío' })
  patient: CreatePatientDto;
}
