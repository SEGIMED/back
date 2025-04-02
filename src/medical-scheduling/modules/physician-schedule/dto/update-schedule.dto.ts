import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  day_of_week?: number;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in format HH:MM (24-hour)',
  })
  start_time?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in format HH:MM (24-hour)',
  })
  end_time?: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  appointment_length?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  simultaneous_slots?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  break_between?: number;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Rest start time must be in format HH:MM (24-hour)',
  })
  rest_start?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Rest end time must be in format HH:MM (24-hour)',
  })
  rest_end?: string;

  @IsBoolean()
  @IsOptional()
  is_working_day?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['Presencial', 'Virtual'])
  modality?: string;

  @IsString()
  @IsOptional()
  office_id?: string;
}
