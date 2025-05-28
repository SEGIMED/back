import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyResponseDto {
  @ApiProperty({
    description: 'Specialty ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Specialty name',
    example: 'Cardiología',
  })
  name: string;
}

export class MeasureUnitResponseDto {
  @ApiProperty({
    description: 'Measure unit ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Measure unit name',
    example: 'mmHg',
  })
  name: string;

  @ApiProperty({
    description: 'Measure unit description',
    example: 'Milímetros de mercurio',
  })
  description: string;
}

export class VitalSignResponseDto {
  @ApiProperty({
    description: 'Vital sign ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the vital sign',
    example: 'Presión arterial',
  })
  name: string;

  @ApiProperty({
    description: 'Category of the vital sign',
    example: 'Cardiovascular',
  })
  category: string;

  @ApiProperty({
    description: 'Color associated with the vital sign for UI display',
    example: '#FF5733',
    nullable: true,
  })
  color?: string;

  @ApiProperty({
    description: 'Mini icon identifier for the vital sign',
    example: 'heart-mini',
    nullable: true,
  })
  mini_icon?: string;

  @ApiProperty({
    description: 'Icon identifier for the vital sign',
    example: 'heart-icon',
    nullable: true,
  })
  icon?: string;

  @ApiProperty({
    description: 'Background icon identifier for the vital sign',
    example: 'heart-background',
    nullable: true,
  })
  background_icon?: string;

  @ApiProperty({
    description: 'Normal minimum value for the vital sign',
    example: 60,
    nullable: true,
  })
  normal_min_value?: number;

  @ApiProperty({
    description: 'Normal maximum value for the vital sign',
    example: 100,
    nullable: true,
  })
  normal_max_value?: number;

  @ApiProperty({
    description: 'Slightly high threshold value for the vital sign',
    example: 120,
    nullable: true,
  })
  slightly_high_value?: number;

  @ApiProperty({
    description: 'High maximum value for the vital sign',
    example: 140,
    nullable: true,
  })
  high_max_value?: number;

  @ApiProperty({
    description: 'Critical maximum value for the vital sign',
    example: 180,
    nullable: true,
  })
  critical_max_value?: number;

  @ApiProperty({
    description: 'Associated specialties',
    type: [SpecialtyResponseDto],
  })
  specialties: SpecialtyResponseDto[];

  @ApiProperty({
    description: 'Associated measure unit',
    type: MeasureUnitResponseDto,
    nullable: true,
  })
  cat_measure_unit?: MeasureUnitResponseDto;
}
