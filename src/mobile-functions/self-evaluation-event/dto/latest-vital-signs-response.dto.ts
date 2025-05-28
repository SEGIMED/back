import { ApiProperty } from '@nestjs/swagger';

export class MeasureUnitDto {
  @ApiProperty({
    description: 'ID of the measure unit',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the measure unit',
    example: 'bpm',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the measure unit',
    example: 'Latidos por minuto',
  })
  description: string;
}

export class VitalSignCatalogDto {
  @ApiProperty({
    description: 'ID of the vital sign catalog',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the vital sign',
    example: 'Frecuencia Cardíaca',
  })
  name: string;

  @ApiProperty({
    description: 'Category of the vital sign',
    example: 'Cardiovascular',
  })
  category: string;

  @ApiProperty({
    description: 'Color associated with the vital sign',
    example: '#FF5733',
    nullable: true,
  })
  color?: string;

  @ApiProperty({
    description: 'Mini icon identifier',
    example: 'heart-mini',
    nullable: true,
  })
  mini_icon?: string;

  @ApiProperty({
    description: 'Icon identifier',
    example: 'heart-icon',
    nullable: true,
  })
  icon?: string;

  @ApiProperty({
    description: 'Background icon identifier',
    example: 'heart-background',
    nullable: true,
  })
  background_icon?: string;

  @ApiProperty({
    description: 'Normal minimum value',
    example: 60,
    nullable: true,
  })
  normal_min_value?: number;

  @ApiProperty({
    description: 'Normal maximum value',
    example: 100,
    nullable: true,
  })
  normal_max_value?: number;

  @ApiProperty({
    description: 'Slightly high value threshold',
    example: 120,
    nullable: true,
  })
  slightly_high_value?: number;

  @ApiProperty({
    description: 'High maximum value',
    example: 140,
    nullable: true,
  })
  high_max_value?: number;

  @ApiProperty({
    description: 'Critical maximum value',
    example: 180,
    nullable: true,
  })
  critical_max_value?: number;
}

export class LatestVitalSignDto {
  @ApiProperty({
    description: 'Vital sign catalog information',
    type: VitalSignCatalogDto,
  })
  vital_sign: VitalSignCatalogDto;

  @ApiProperty({
    description: 'Latest measured value or "Sin datos" if no data available',
    example: 98,
    oneOf: [{ type: 'number' }, { type: 'string', enum: ['Sin datos'] }],
  })
  measure: number | 'Sin datos';

  @ApiProperty({
    description: 'Date when the measurement was recorded',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  created_at?: Date;

  @ApiProperty({
    description: 'Measure unit information',
    type: MeasureUnitDto,
    nullable: true,
  })
  cat_measure_unit?: MeasureUnitDto;
}

export class LatestVitalSignsResponseDto {
  @ApiProperty({
    description: 'Array of latest vital signs for all catalog types',
    type: [LatestVitalSignDto],
  })
  data: LatestVitalSignDto[];
}
