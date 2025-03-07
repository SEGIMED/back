import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubcatCieDiezDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
