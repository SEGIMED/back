import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePatientDto {
  @IsString({ message: 'La dirección debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La dirección debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  direction?: string;

  @IsString({ message: 'El país debe ser un texto válido.' })
  @Length(3, 50, { message: 'El país debe tener entre 3 y 50 caracteres.' })
  country: string;

  @IsString({ message: 'La provincia debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'La provincia debe tener entre 3 y 50 caracteres.',
  })
  province: string;

  @IsString({ message: 'La ciudad debe ser un texto válido.' })
  @Length(3, 50, { message: 'La ciudad debe tener entre 3 y 50 caracteres.' })
  city: string;

  @IsString({ message: 'El código postal debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El código postal debe tener entre 3 y 50 caracteres.',
  })
  postal_code: string;

  @IsString({ message: 'El número de dirección debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El número de dirección debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  direction_number?: string;

  @IsString({ message: 'El apartamento debe ser un texto válido.' })
  @Length(1, 50, {
    message: 'El apartamento debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  apartment?: string;

  @IsString({ message: 'El número de seguro médico debe ser un texto válido.' })
  @Length(3, 50, {
    message: 'El número de seguro médico debe tener entre 3 y 50 caracteres.',
  })
  @IsOptional()
  health_care_number?: string;
}
