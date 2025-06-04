import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiProperty({
    description: 'Reason for canceling the appointment',
    example: 'No puedo asistir por motivos personales',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La razón debe ser una cadena de texto' })
  @Length(0, 500, { message: 'La razón no puede exceder 500 caracteres' })
  reason?: string;
}
