import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCatMeasureUnitDto {
  /**
   * Measure unit name
   * @example "mmHg"
   */
  @IsString()
  name: string;

  /**
   * Measure unit description
   * @example "Milímetros de mercurio"
   */
  @IsString()
  description: string;

  /**
   * ID of the related vital sign
   * @example 1
   */
  @IsNumber()
  cat_vital_signs_id: number;
}
