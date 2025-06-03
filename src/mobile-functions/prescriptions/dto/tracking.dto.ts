import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { IsDate, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class TrackingQueryDto {
  @ApiProperty({
    description: 'Date to get prescriptions for (YYYY-MM-DD)',
    example: '2025-06-01',
  })
  @IsString()
  @IsOptional()
  date?: string;
}

export class ActivateTrackingDto {
  @ApiProperty({
    description: 'Time of the first dose (ISO 8601 format)',
    example: '2025-06-01T08:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        'Invalid date format for first_dose_taken_at',
      );
    }
    return date;
  })
  first_dose_taken_at: Date;
}

export class ToggleReminderDto {
  @ApiProperty({
    description: 'Whether reminders should be enabled',
    example: true,
  })
  @IsBoolean()
  reminder_enabled: boolean;
}
