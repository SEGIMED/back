import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';

@Injectable()
export class MedicalEventsService {
  constructor(private prisma: PrismaService) {}

  async createMedicalEvent(data: CreateMedicalEventDto) {
    return this.prisma.medicalEvent.create({ data });
  }
}
