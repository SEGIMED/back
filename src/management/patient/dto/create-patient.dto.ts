import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiPropertyOptional({
    description: "Patient's street address",
    example: 'Av. Insurgentes Sur',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La dirección debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  direction?: string;

  @ApiProperty({
    description: "Patient's country",
    example: 'México',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El país debe ser un texto válido.' })
  @Length(3, 50, { message: 'El país debe tener entre 3 y 50 caracteres.' })
  country: string;

  @ApiProperty({
    description: "Patient's state/province",
    example: 'Ciudad de México',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'La provincia debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La provincia debe tener entre 3 y 50 caracteres.',
  })
  province: string;

  @ApiProperty({
    description: "Patient's city",
    example: 'Coyoacán',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @Length(3, 50, { message: 'La ciudad debe tener entre 3 y 50 caracteres.' })
  city: string;

  @ApiProperty({
    description: "Patient's postal code",
    example: '04510',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El código postal debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El código postal debe tener entre 3 y 50 caracteres.',
  })
  postal_code: string;

  @ApiPropertyOptional({
    description: "Patient's address number",
    example: '3000',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El número de dirección debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El número de dirección debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  direction_number?: string;

  @ApiPropertyOptional({
    description: "Patient's apartment number",
    example: '42B',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'El apartamento debe ser un texto válido.' })
  @Length(1, 50, {
    message: 'El apartamento debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  apartment?: string;

  @ApiPropertyOptional({
    description: "Patient's health insurance number",
    example: 'IMSS-12345678',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El número de seguro médico debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El número de seguro médico debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  health_care_number?: string;
}
