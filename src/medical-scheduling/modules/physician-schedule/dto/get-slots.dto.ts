import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetSlotsDto {
  @ApiProperty({
    description: 'Date to check for available slots (YYYY-MM-DD)',
    example: '2024-07-20',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description:
      'Optional end date to check for available slots in a range (YYYY-MM-DD)',
    example: '2024-07-27',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
