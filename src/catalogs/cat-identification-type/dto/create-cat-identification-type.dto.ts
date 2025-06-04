import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatIdentificationTypeDto {
  @ApiProperty({
    description: 'Name of the identification type',
    example: 'Cédula de Ciudadanía',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Description of the identification type',
    example: 'Documento de identificación nacional para ciudadanos',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 255, { message: 'La descripción no puede exceder 255 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Country where this identification type is valid',
    example: 'Colombia',
    maxLength: 100,
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El país debe tener entre 1 y 100 caracteres' })
  country: string;
}
