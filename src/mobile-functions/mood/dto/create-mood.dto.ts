import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateMoodDto {
  @ApiProperty({
    description: 'Nivel de estado de ánimo (1-5)',
    example: 4,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'El nivel de estado de ánimo es obligatorio' })
  @IsInt({ message: 'El nivel de estado de ánimo debe ser un número entero' })
  @Min(1, { message: 'El nivel mínimo es 1 (Muy mal)' })
  @Max(5, { message: 'El nivel máximo es 5 (Muy bien)' })
  mood_level: number;
}
