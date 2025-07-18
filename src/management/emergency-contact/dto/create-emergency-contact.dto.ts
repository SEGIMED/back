import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class CreateEmergencyContactDto {

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del paciente debe ser un texto válido.' })
  patient_id: string;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del contacto de emergencia debe ser un texto válido.' })
  contact_name: string;

  @ApiProperty({
    description: 'Relación del contacto de emergencia',
    example: 'Padre',
  })
  @IsString({ message: 'La relación del contacto de emergencia debe ser un texto válido.' })
  relationship: string;

  @ApiProperty({
    description: 'Email del contacto de emergencia',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'El email debe estar en un formato válido.' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Prefijo del teléfono del contacto de emergencia',
    example: '+52',
  })
  @IsString({ message: 'El prefijo del teléfono debe estar en un formato válido.' })
  phone_prefix: string;

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
  phone: string;
}