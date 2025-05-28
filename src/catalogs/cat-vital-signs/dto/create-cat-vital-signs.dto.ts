import {
  IsString,
  IsArray,
  IsNumber,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatVitalSignsDto {
  @ApiProperty({
    description: 'Name of the vital sign',
    example: 'Heart Rate',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category of the vital sign',
    example: 'Cardiovascular',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'List of specialty IDs associated with this vital sign',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  specialties: number[];

  @ApiProperty({
    description: 'Color associated with the vital sign for UI display',
    example: '#FF5733',
  })
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Mini icon identifier for the vital sign',
    example: 'heart-mini',
  })
  @IsString()
  mini_icon: string;

  @ApiProperty({
    description: 'Icon identifier for the vital sign',
    example: 'heart-icon',
  })
  @IsString()
  icon: string;

  @ApiProperty({
    description: 'Background icon identifier for the vital sign',
    example: 'heart-background',
    required: false,
  })
  @IsOptional()
  @IsString()
  background_icon?: string;

  @ApiProperty({
    description: 'Normal minimum value for the vital sign',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  normal_min_value?: number;

  @ApiProperty({
    description: 'Normal maximum value for the vital sign',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  normal_max_value?: number;

  @ApiProperty({
    description: 'Slightly high threshold value for the vital sign',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  slightly_high_value?: number;

  @ApiProperty({
    description: 'High maximum value for the vital sign',
    example: 140,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  high_max_value?: number;

  @ApiProperty({
    description: 'Critical maximum value for the vital sign',
    example: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  critical_max_value?: number;

  @ApiProperty({
    description: 'ID of the measure unit associated with this vital sign',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cat_measure_unit_id?: number;
}
