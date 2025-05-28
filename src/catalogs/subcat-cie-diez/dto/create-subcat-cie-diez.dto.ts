import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubcatCieDiezDto {
  @ApiProperty({
    description: 'Código de la subcategoría CIE-10',
    example: 'A01.0',
    type: String,
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Descripción de la subcategoría CIE-10',
    example: 'Fiebre tifoidea',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description:
      'ID de la categoría CIE-10 a la que pertenece esta subcategoría',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
