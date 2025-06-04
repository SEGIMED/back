import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum FrequencyType {
  EVERY_X_HOURS = 'EVERY_X_HOURS',
  TIMES_PER_DAY = 'TIMES_PER_DAY',
  ONCE_DAILY = 'ONCE_DAILY',
}

export class CreateSelfAssignedPrescriptionDto {
  @ApiProperty({
    description: 'Monodrug (active ingredient) name',
    example: 'Paracetamol',
  })
  @IsString()
  @IsNotEmpty()
  monodrug: string;

  @ApiProperty({
    description: 'Dose quantity',
    example: '500',
  })
  @IsString()
  @IsNotEmpty()
  dose: string;

  @ApiProperty({
    description: 'Dose units (mg, ml, etc.)',
    example: 'mg',
  })
  @IsString()
  @IsNotEmpty()
  dose_units: string;

  @ApiProperty({
    description: 'Type of frequency',
    enum: FrequencyType,
    example: FrequencyType.EVERY_X_HOURS,
  })
  @IsEnum(FrequencyType)
  @IsNotEmpty()
  frequency_type: FrequencyType;

  @ApiProperty({
    description: 'Frequency value (depends on frequency_type)',
    example: 8,
  })
  @IsNumber()
  @IsNotEmpty()
  frequency_value: number;

  @ApiProperty({
    description: 'Time of the first dose (ISO 8601 format)',
    example: '2025-06-01T08:00:00.000Z',
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsNotEmpty()
  first_dose_time: Date;

  @ApiProperty({
    description: 'Optional observations for this medication',
    example: 'Take with food',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;
}
