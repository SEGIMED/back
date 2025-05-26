import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExceptionDto {
  @ApiProperty({
    description: 'Date of the exception (YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Whether the physician is available on this exception date',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_available: boolean;

  @ApiProperty({
    description: 'Reason for the exception (e.g., holiday, vacation)',
    example: 'Christmas Day',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
