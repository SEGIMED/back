import { IsString, IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class CreateCatVitalSignsDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  specialties: number[];

  @IsString()
  color: string;

  @IsString()
  mini_icon: string;

  @IsString()
  icon: string;
}
