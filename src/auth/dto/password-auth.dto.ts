import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class RequestPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  email: string;
}

export class ResetPasswordDto {
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

  @IsNotEmpty({ message: 'El token es obligatorio.' })
  token: string;
}
