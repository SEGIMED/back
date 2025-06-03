import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
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
  @Transform(({ value }) => new Date(value))
  first_dose_taken_at: Date;
}

export class ToggleReminderDto {
  @ApiProperty({
    description: 'Whether reminders should be enabled',
    example: true,
  })
  reminder_enabled: boolean;
}
