import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    description:
      'Day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  day_of_week: number;

  @ApiProperty({
    description: 'Start time in HH:MM format (24-hour)',
    example: '09:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in format HH:MM (24-hour)',
  })
  start_time: string;

  @ApiProperty({
    description: 'End time in HH:MM format (24-hour)',
    example: '17:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in format HH:MM (24-hour)',
  })
  end_time: string;

  @ApiProperty({
    description: 'Duration of each appointment in minutes',
    example: 30,
    minimum: 5,
  })
  @IsInt()
  @Min(5)
  @IsNotEmpty()
  appointment_length: number;

  @ApiProperty({
    description: 'Number of simultaneous appointments allowed',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  simultaneous_slots: number;

  @ApiProperty({
    description: 'Break time between appointments in minutes',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  break_between: number;

  @ApiProperty({
    description: 'Start time of the rest period in HH:MM format (24-hour)',
    example: '12:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Rest start time must be in format HH:MM (24-hour)',
  })
  rest_start?: string;

  @ApiProperty({
    description: 'End time of the rest period in HH:MM format (24-hour)',
    example: '13:00',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Rest end time must be in format HH:MM (24-hour)',
  })
  rest_end?: string;

  @ApiProperty({
    description: 'Indicates if it is a working day',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_working_day: boolean;

  @ApiProperty({
    description: 'Modality of the schedule',
    example: 'Presencial',
    enum: ['Presencial', 'Virtual'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Presencial', 'Virtual'])
  modality: string;

  @ApiProperty({
    description: 'ID of the office (if modality is Presencial)',
    example: 'clx0k2q00000008l0e1g2h3i4',
    required: false,
  })
  @IsString()
  @IsOptional()
  office_id?: string;
}
