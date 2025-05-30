import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateCatMeasureUnitDto {
  /**
   * Measure unit name
   * @example "mmHg"
   */
  @ApiProperty({ example: 'mmHg', description: 'Measure unit name' })
  @IsString()
  name: string;

  /**
   * Measure unit description
   * @example "Milímetros de mercurio"
   */
  @ApiProperty({
    example: 'Milímetros de mercurio',
    description: 'Measure unit description',
  })
  @IsString()
  description: string;

  /**
   * ID of the related vital sign
   * @example 1
   */
  @ApiProperty({
    example: 1,
    description: 'ID of the related vital sign',
  })
  @IsNumber()
  cat_vital_signs_id: number;

  /**
   * Minimum value
   * @example 0
   */
  @ApiProperty({ example: 0, description: 'Minimum value' })
  @IsNumber()
  min_value: number;

  /**
   * Maximum value
   * @example 100
   */
  @ApiProperty({ example: 100, description: 'Maximum value' })
  @IsNumber()
  max_value: number;
}
