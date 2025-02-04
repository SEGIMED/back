import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Length,
} from 'class-validator';
import { role_type } from '@prisma/client';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  name: string;

  @IsString({ message: 'El apellido debe ser un texto válido.' })
  @Length(3, 50, { message: 'El apellido debe tener entre 3 y 50 caracteres.' })
  last_name: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsString({ message: 'El DNI debe ser un texto válido.' })
  @Length(7, 9, { message: 'El DNI debe tener entre 10 y 15 caracteres.' })
  @IsOptional()
  dni?: string;

  @IsOptional()
  birthdate?: Date;

  @IsString({ message: 'La nacionalidad debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La nacionalidad debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  nationality: string;

  @IsString({ message: 'El género debe ser un texto válido.' })
  @Length(1, 14, { message: 'El género debe tener entre 1 y 14 caracteres.' })
  @IsOptional()
  gender: string;

  @IsString({ message: 'El prefijo del teléfono debe ser un texto válido.' })
  @Length(1, 4, {
    message: 'El prefijo del teléfono debe tener entre 1 y 4 caracteres.',
  })
  phone_prefix: string;

  @IsString({ message: 'El número de teléfono debe ser un texto válido.' })
  @Length(4, 20, {
    message: 'El número de teléfono debe tener entre 4 y 20 caracteres.',
  })
  phone: string;

  @IsBoolean({
    message: 'El estado de verificación debe ser un valor booleano.',
  })
  is_phone_verified: boolean;

  @IsOptional()
  @IsString({ message: 'El código de verificación debe ser un texto válido.' })
  @Length(4, 4, {
    message: 'El código de verificación debe tener entre 4  caracteres.',
  })
  verification_code?: string;

  @IsOptional()
  @IsDate({
    message: 'La fecha de expiración del código debe ser una fecha válida.',
  })
  code_expires_at?: Date;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, incluyendo 1 número, 1 letra minúscula, 1 letra mayúscula y 1 símbolo.',
    },
  )
  password: string;

  @IsUrl({}, { message: 'La URL de la imagen no tiene un formato válido.' })
  @IsOptional()
  image: string;

  @IsString({ message: 'El rol debe ser un texto válido.' })
  @IsOptional()
  role: role_type;

  @IsOptional()
  tenant_id: string;
}

export class GoogleUserDto {
  @IsOptional()
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @IsOptional()
  image: string;
}
