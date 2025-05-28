import { ApiProperty } from '@nestjs/swagger';
import {
  VitalSignCatalogDto,
  MeasureUnitDto,
} from './latest-vital-signs-response.dto';

export class DayDataDto {
  @ApiProperty({
    description: 'Day of the month (1-31)',
    example: 15,
  })
  day: number;

  @ApiProperty({
    description: 'Average measure for the day or "Sin datos" if no records',
    example: 98.5,
    oneOf: [{ type: 'number' }, { type: 'string', enum: ['Sin datos'] }],
  })
  average_measure: number | 'Sin datos';

  @ApiProperty({
    description: 'Number of records for this day',
    example: 3,
  })
  records_count: number;
}

export class WeekDataDto {
  @ApiProperty({
    description: 'Week number in the month (1-6)',
    example: 2,
  })
  week_number: number;

  @ApiProperty({
    description: 'Start date of the week (Sunday)',
    example: '2023-10-08',
  })
  week_start: string;

  @ApiProperty({
    description: 'End date of the week (Saturday)',
    example: '2023-10-14',
  })
  week_end: string;

  @ApiProperty({
    description: 'Data for each day of the week (Sunday to Saturday)',
    type: [DayDataDto],
  })
  days: DayDataDto[];
}

export class MonthlyStatsDto {
  @ApiProperty({
    description: 'Last recorded value in the month',
    example: 102,
    nullable: true,
  })
  last_value?: number;

  @ApiProperty({
    description: 'Date of the last recorded value',
    example: '2023-10-28T14:30:00.000Z',
    nullable: true,
  })
  last_value_date?: Date;

  @ApiProperty({
    description: 'Maximum value recorded in the month',
    example: 110,
    nullable: true,
  })
  max_value?: number;

  @ApiProperty({
    description: 'Date of the maximum value',
    example: '2023-10-15T09:15:00.000Z',
    nullable: true,
  })
  max_value_date?: Date;

  @ApiProperty({
    description: 'Minimum value recorded in the month',
    example: 85,
    nullable: true,
  })
  min_value?: number;

  @ApiProperty({
    description: 'Date of the minimum value',
    example: '2023-10-03T07:45:00.000Z',
    nullable: true,
  })
  min_value_date?: Date;

  @ApiProperty({
    description: 'Average of all values recorded in the month',
    example: 96.8,
    nullable: true,
  })
  average_value?: number;

  @ApiProperty({
    description: 'Total number of records in the month',
    example: 25,
  })
  total_records: number;

  @ApiProperty({
    description: 'Number of records that exceeded critical thresholds (alerts)',
    example: 3,
  })
  alerts_count: number;
}

export class VitalSignHistoryResponseDto {
  @ApiProperty({
    description: 'Vital sign catalog information',
    type: VitalSignCatalogDto,
  })
  vital_sign: VitalSignCatalogDto;

  @ApiProperty({
    description: 'Measure unit information',
    type: MeasureUnitDto,
    nullable: true,
  })
  cat_measure_unit?: MeasureUnitDto;

  @ApiProperty({
    description: 'Requested month in YYYY-MM format',
    example: '2023-10',
  })
  month: string;

  @ApiProperty({
    description: 'Monthly statistics and analytics',
    type: MonthlyStatsDto,
  })
  monthly_stats: MonthlyStatsDto;

  @ApiProperty({
    description: 'Weekly data organization (Sunday to Saturday)',
    type: [WeekDataDto],
  })
  weekly_data: WeekDataDto[];
}
