import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'New password for the user',
    example: 'StrongP@ss123',
    required: true,
    minLength: 8,
  })
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

  @ApiProperty({
    description: 'Token received via email for password reset',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsNotEmpty({ message: 'El token es obligatorio.' })
  token: string;
}
