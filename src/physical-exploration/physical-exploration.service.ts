import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationDto } from './dto/create-physical-exploration.dto';

@Injectable()
export class PhysicalExplorationService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExploration(data: CreatePhysicalExplorationDto) {
    //TODO: Verifícar si ya existe una exploración física para el evento médico
    return await this.prisma.physical_exploration.create({
      data: {
        patient_id: data.patient_id,
        physician_id: data.physician_id,
        medical_event_id: data.medical_event_id,
        description: data.description,
        physical_exploration_area_id: data.physical_exploration_area_id,
        tenant_id: data.tenant_id,
      },
    });
  }
}
