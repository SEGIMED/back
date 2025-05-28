import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateScheduleDto } from './create-schedule.dto';

export class BulkCreateScheduleDto {
  @ApiProperty({
    description: 'Array of schedule entries to create or update',
    type: [CreateScheduleDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  schedules: CreateScheduleDto[];
}
