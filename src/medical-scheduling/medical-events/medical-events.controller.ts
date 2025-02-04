import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { MedicalEventsService } from './medical-events.service';

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
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
  ) {
    const filters = {
      patient_id,
      physician_id,
      page,
      pageSize,
      orderBy,
      orderDirection,
    };
    return this.medicalEventsService.getMedicalEvents(filters);
  }
}
