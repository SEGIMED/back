import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

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
  @IsEnum(StatisticsType)
  type: StatisticsType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @IsOptional()
  @IsUUID()
  physicianId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  specialtyId?: number;

  @IsOptional()
  @IsString()
  filter?: string;
}
