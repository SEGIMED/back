import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum StatisticsType {
  APPOINTMENTS_BY_STATUS = 'appointments_by_status',
  APPOINTMENTS_BY_DAY = 'appointments_by_day',
  APPOINTMENTS_BY_MONTH = 'appointments_by_month',
  APPOINTMENTS_BY_PHYSICIAN = 'appointments_by_physician',
  DIAGNOSES_DISTRIBUTION = 'diagnoses_distribution',
  CONSULTATIONS_COUNT = 'consultations_count',
  PATIENT_DEMOGRAPHICS = 'patient_demographics',
  ATTENDANCE_RATE = 'attendance_rate',
  PHYSICIAN_WORKLOAD = 'physician_workload',
  SCHEDULING_TRENDS = 'scheduling_trends',
}

export enum GroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  PHYSICIAN = 'physician',
  PATIENT = 'patient',
  STATUS = 'status',
  SPECIALTY = 'specialty',
  DIAGNOSIS = 'diagnosis',
}

export class GetStatisticsDto {
  @ApiProperty({
    description: 'Tipo de estadísticas a recuperar',
    enum: StatisticsType,
    enumName: 'StatisticsType',
    example: 'appointments_by_status',
    required: true,
  })
  @IsEnum(StatisticsType)
  type: StatisticsType;

  @ApiProperty({
    description: 'Fecha de inicio para las estadísticas (formato ISO)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para las estadísticas (formato ISO)',
    example: '2025-05-23T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Cómo agrupar las estadísticas',
    enum: GroupBy,
    enumName: 'GroupBy',
    example: 'month',
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;

  @ApiProperty({
    description: 'Límite de resultados a devolver',
    example: 10,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @ApiProperty({
    description: 'Filtrar por ID de médico',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  physicianId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de paciente',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de especialidad',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  specialtyId?: number;

  @ApiProperty({
    description: 'Criterios de filtro adicionales',
    example: 'consulta',
    required: false,
  })
  @IsOptional()
  @IsString()
  filter?: string;
}
