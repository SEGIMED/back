import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreatePatientDto } from './create-patient.dto';

export class MedicalPatientDto {
  user: Omit<CreateUserDto, 'role' | 'password'>;
  patient: CreatePatientDto;
}
