import { tenant_type } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class OnboardingDto {
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  user_id: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  name: string;

  @IsEnum(tenant_type, {
    message: `El tipo debe ser uno de los siguientes: ${Object.values(tenant_type).join(', ')}`,
  })
  type: tenant_type;

  @IsOptional()
  @IsInt({ message: 'El número de empleados debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 empleado' })
  number_of_employees?: number;

  @IsOptional()
  @IsInt({ message: 'El número de pacientes debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 paciente' })
  number_of_patients?: number;

  @IsString()
  @IsNotEmpty({ message: 'El motivo de registro es obligatorio' })
  @MaxLength(50, {
    message: 'El motivo de registro no puede tener más de 50 caracteres',
  })
  reason_register: string;

  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  speciality?: number[];
}
