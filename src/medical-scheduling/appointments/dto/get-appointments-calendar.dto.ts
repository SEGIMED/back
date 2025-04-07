import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { status_type } from '@prisma/client';
import { Transform } from 'class-transformer';

export class GetAppointmentsCalendarDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(['dia', 'semana', 'mes'])
  @IsOptional()
  view?: 'dia' | 'semana' | 'mes' = 'semana';

  @IsEnum(['atendida', 'cancelada', 'pendiente'])
  @IsOptional()
  status?: status_type;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  month?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  year?: number;
}
