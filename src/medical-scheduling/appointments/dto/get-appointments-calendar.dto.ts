import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { status_type } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetAppointmentsCalendarDto {
  @ApiProperty({
    description: 'Fecha de inicio para filtrar citas (formato ISO)',
    example: '2025-05-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para filtrar citas (formato ISO)',
    example: '2025-05-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Vista del calendario',
    enum: ['dia', 'semana', 'mes'],
    default: 'semana',
    required: false,
  })
  @IsEnum(['dia', 'semana', 'mes'])
  @IsOptional()
  view?: 'dia' | 'semana' | 'mes' = 'semana';

  @ApiProperty({
    description: 'Estado de las citas a filtrar',
    enum: ['atendida', 'cancelada', 'pendiente'],
    required: false,
  })
  @IsEnum(['atendida', 'cancelada', 'pendiente'])
  @IsOptional()
  status?: status_type;

  @ApiProperty({
    description: 'Mes para filtrar (1-12)',
    example: 5,
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  month?: number;

  @ApiProperty({
    description: 'Año para filtrar',
    example: 2025,
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  year?: number;
}
