import { Body, Controller, Post } from '@nestjs/common';
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
}
