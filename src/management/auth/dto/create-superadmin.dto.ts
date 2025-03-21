import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateSuperAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  last_name: string;

  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido' },
  )
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsUUID('4', { message: 'El ID del tenant debe ser un UUID válido' })
  @IsOptional()
  tenant_id?: string;

  @IsString()
  @IsNotEmpty({ message: 'La clave secreta es obligatoria' })
  secret_key: string;
}
