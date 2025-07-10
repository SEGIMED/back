import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { marital_status, role_type } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BaseUserDto {
  @ApiProperty({
    description: "User's first name",
    example: 'Juan',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'El nombre debe ser un texto válido.' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  name: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Pérez',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El apellido debe ser un texto válido.' })
  @Length(3, 50, { message: 'El apellido debe tener entre 3 y 50 caracteres.' })
  last_name: string;

  @ApiProperty({
    description: "User's email address",
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @ApiPropertyOptional({
    description: "User's national ID number",
    example: '12345678',
    minLength: 7,
    maxLength: 9,
  })
  @IsString({ message: 'El DNI debe ser un texto válido.' })
  @Length(7, 9, { message: 'El DNI debe tener entre 7 y 9 caracteres.' })
  @IsOptional()
  dni?: string;

  @ApiPropertyOptional({
    description: "User's birth date",
    example: '1990-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  birth_date?: Date;

  @ApiPropertyOptional({
    description: "User's nationality",
    example: 'Mexicana',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'La nacionalidad debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La nacionalidad debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  nationality: string;

  @ApiPropertyOptional({
    description: "User's marital status",
    example: 'soltero',
    enum: marital_status,
  })
  @IsEnum(marital_status, {
    message: 'El estado civil debe ser un valor válido del enum.',
  })
  @IsOptional()
  marital_status?: marital_status;

  @ApiPropertyOptional({
    description: "User's gender",
    example: 'Masculino',
    minLength: 1,
    maxLength: 14,
  })
  @IsString({ message: 'El género debe ser un texto válido.' })
  @Length(1, 14, { message: 'El género debe tener entre 1 y 14 caracteres.' })
  @IsOptional()
  gender: string;

  @ApiPropertyOptional({
    description: 'Phone number prefix (country code)',
    example: '+52',
    minLength: 1,
    maxLength: 4,
  })
  @IsString({ message: 'El prefijo del teléfono debe ser un texto válido.' })
  @Length(1, 4, {
    message: 'El prefijo del teléfono debe tener entre 1 y 4 caracteres.',
  })
  @IsOptional()
  phone_prefix?: string;

  @ApiPropertyOptional({
    description: "User's phone number",
    example: '9876543210',
    minLength: 4,
    maxLength: 20,
  })
  @IsString({ message: 'El número de teléfono debe ser un texto válido.' })
  @Length(4, 20, {
    message: 'El número de teléfono debe tener entre 4 y 20 caracteres.',
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: "URL to user's profile image",
    example: 'https://example.com/profile.jpg',
  })
  @IsUrl({}, { message: 'La URL de la imagen no tiene un formato válido.' })
  @IsOptional()
  image: string;

  @ApiPropertyOptional({
    description: "User's role in the system",
    example: 'patient',
    enum: ['patient', 'physician', 'admin', 'secretary'],
  })
  @IsString({ message: 'El rol debe ser un texto válido.' })
  @IsOptional()
  role: role_type;
}

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    description: "User's password",
    example: 'StrongP@ss123',
    minLength: 8,
    writeOnly: true,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password?: string;
}

export class GoogleUserDto {
  @ApiPropertyOptional({
    description: "User's name from Google account",
    example: 'Juan Pérez',
  })
  @IsOptional()
  name: string;

  @ApiProperty({
    description: "User's email from Google account",
    example: 'juan.perez@gmail.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @ApiPropertyOptional({
    description: "URL to user's Google profile image",
    example: 'https://lh3.googleusercontent.com/a-/profile-picture',
  })
  @IsOptional()
  image: string;
}
