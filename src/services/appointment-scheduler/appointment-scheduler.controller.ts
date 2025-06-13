import { Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { TenantAccessGuard } from 'src/auth/guards/tenant-access.guard';

@ApiTags('appointment-scheduler')
@Controller('appointment-scheduler')
@UseGuards(TenantAccessGuard)
@ApiBearerAuth()
export class AppointmentSchedulerController {
  constructor(
    private readonly appointmentSchedulerService: AppointmentSchedulerService,
  ) {}

  @Post('process-expired')
  @ApiOperation({
    summary: 'Procesar manualmente citas expiradas',
    description:
      'Ejecuta manualmente el proceso de marcado de citas pendientes como no_asistida',
  })
  @ApiResponse({
    status: 200,
    description: 'Proceso ejecutado exitosamente',
    schema: {
      type: 'object',
      properties: {
        processedCount: { type: 'number' },
        expiredAppointments: { type: 'array' },
      },
    },
  })
  async processExpiredAppointments() {
    return await this.appointmentSchedulerService.manualProcessExpiredAppointments();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de citas por estado',
    description:
      'Devuelve el conteo de citas por estado en un rango de fechas opcional',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        pendiente: { type: 'number' },
        atendida: { type: 'number' },
        cancelada: { type: 'number' },
        no_asistida: { type: 'number' },
      },
    },
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return await this.appointmentSchedulerService.getAppointmentStatusStatistics(
      start,
      end,
      tenantId,
    );
  }
}
