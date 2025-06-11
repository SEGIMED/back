import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ScheduleUpdateScope {
  FUTURE_ONLY = 'FUTURE_ONLY',
  PERMANENT = 'PERMANENT',
}

export class UpdatePrescriptionScheduleDto {
  @ApiProperty({
    description:
      'Array of time slots for medication (e.g., ["08:00", "14:00", "20:00"])',
    example: ['08:00', '14:00', '20:00'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  time_of_day_slots?: string[];

  @ApiProperty({
    description:
      'New first dose taken timestamp (if updating the schedule permanently)',
    example: '2025-06-10T08:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ValidateIf((o) => o.scope === ScheduleUpdateScope.PERMANENT)
  first_dose_taken_at?: Date;

  @ApiProperty({
    description:
      'Scope of the schedule update - affects only future doses or permanently changes the schedule',
    enum: ScheduleUpdateScope,
    example: ScheduleUpdateScope.FUTURE_ONLY,
  })
  @IsEnum(ScheduleUpdateScope)
  scope: ScheduleUpdateScope;
}
