import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetSlotsDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
