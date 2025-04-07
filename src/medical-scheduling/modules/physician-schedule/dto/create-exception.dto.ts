import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExceptionDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsBoolean()
  @IsNotEmpty()
  is_available: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}
