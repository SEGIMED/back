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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardingDto {
  @ApiProperty({
    description: 'ID del usuario que completa el onboarding',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'El id del usuario es obligatorio' })
  user_id: string;

  @ApiProperty({
    description: 'Nombre de la organización o consultorio',
    example: 'Clínica Médica Especializada',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Tipo de tenant (individual u organización)',
    enum: tenant_type,
    example: 'organization',
  })
  @IsEnum(tenant_type, {
    message: `El tipo debe ser uno de los siguientes: ${Object.values(tenant_type).join(', ')}`,
  })
  type: tenant_type;

  @ApiPropertyOptional({
    description: 'Número de empleados (solo para organizaciones)',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El número de empleados debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 empleado' })
  number_of_employees?: number;

  @ApiPropertyOptional({
    description: 'Número de pacientes estimados',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El número de pacientes debe ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 paciente' })
  number_of_patients?: number;

  @ApiProperty({
    description: 'Motivo de registro en la plataforma',
    example: 'Mejorar la gestión de pacientes y citas',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El motivo de registro es obligatorio' })
  @MaxLength(50, {
    message: 'El motivo de registro no puede tener más de 50 caracteres',
  })
  reason_register: string;

  @ApiProperty({
    description: 'IDs de las especialidades médicas',
    example: [1, 3, 5],
    type: [Number],
  })
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  speciality?: number[];
}
