import {
  Body,
  Controller,
  Get,
  Param,
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
    @Param('userId') userId: string,
    @Query('status') status?: status_type,
  ) {
    return this.appointmentsService.getAppointmentsByUser(userId, { status });
  }

  @Patch(':id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: status_type,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, status, reason);
  }
}
