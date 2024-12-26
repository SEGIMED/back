import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { status_type } from '@prisma/client';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get(':userId')
  async getAppointmentsByUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('status') status?: status_type,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
  ) {
    return this.appointmentsService.getAppointmentsByUser(userId, {
      status,
      page,
      pageSize,
      orderBy,
      orderDirection,
    });
  }

  @Patch(':id/status')
  async updateAppointmentStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('status') status: status_type,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, status, reason);
  }
}
