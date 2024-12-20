import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MedicalEventsService } from './medical-events.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';

@Controller('medical-events')
export class MedicalEventsController {
  constructor(private readonly medicalEventsService: MedicalEventsService) {}

  @Post()
  async createMedicalEvent(
    @Body() createMedicalEventDto: CreateMedicalEventDto,
  ) {
    return this.medicalEventsService.createMedicalEvent(createMedicalEventDto);
  }

  @Get()
  async getMedicalEvents(
    @Query('patient_id') patient_id?: string,
    @Query('physician_id') physician_id?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const filters = {
      patient_id,
      physician_id,
      page,
      pageSize,
    };
    return this.medicalEventsService.getMedicalEvents(filters);
  }
}
