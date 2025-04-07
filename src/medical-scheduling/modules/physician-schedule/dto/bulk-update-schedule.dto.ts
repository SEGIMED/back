import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateScheduleDto } from './update-schedule.dto';

export class ScheduleUpdateItem {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => UpdateScheduleDto)
  data: UpdateScheduleDto;
}

export class BulkUpdateScheduleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleUpdateItem)
  schedules: ScheduleUpdateItem[];
}
