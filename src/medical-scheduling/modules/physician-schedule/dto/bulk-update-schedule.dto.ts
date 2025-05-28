import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateScheduleDto } from './update-schedule.dto';

export class ScheduleUpdateItem {
  @ApiProperty({
    description: 'The ID of the schedule to update.',
    example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The data to update the schedule with.',
    type: () => UpdateScheduleDto,
  })
  @ValidateNested()
  @Type(() => UpdateScheduleDto)
  data: UpdateScheduleDto;
}

export class BulkUpdateScheduleDto {
  @ApiProperty({
    description: 'An array of schedule updates.',
    type: [ScheduleUpdateItem],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScheduleUpdateItem)
  schedules: ScheduleUpdateItem[];
}
