import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';

@Injectable()
export class MedicalEventsService {
  constructor(private prisma: PrismaService) {}

  async createMedicalEvent(data: CreateMedicalEventDto) {
    return this.prisma.medicalEvent.create({
      data: {
        appointment_id: data.appointment_id,
        patient_id: data.patient_id,
        physician_id: data.physician_id,
        physician_comments: data.physician_comments ?? '',
        main_diagnostic_cie: data.main_diagnostic_cie ?? '',
        evolution: data.evolution ?? '',
        procedure: data.procedure ?? '',
        treatment: data.treatment ?? '',
        tenant_id: data.tenant_id,
      },
    });
  }
}
