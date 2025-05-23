import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCatCieDiezDto {
  /**
   * Category code
   * @example "A001"
   */
  @ApiProperty({ example: 'A001', description: 'Category code' })
  @IsString()
  code: string;

  /**
   * Category description
   * @example "Fiebres tifoidea y paratifoidea"
   */
  @ApiProperty({
    example: 'Fiebres tifoidea y paratifoidea',
    description: 'Category description',
  })
  @IsString()
  description: string;
}
