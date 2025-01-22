import { IsEmail } from 'class-validator';

export class RequestPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  email: string;
}
