import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationDto } from './dto/create-physical-exploration.dto';

@Injectable()
export class PhysicalExplorationService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExploration(data: CreatePhysicalExplorationDto) {
    try {
      const existingExploration =
        await this.prisma.physical_exploration.findFirst({
          where: {
            medical_event_id: data.medical_event_id,
          },
        });

      if (existingExploration) {
        throw new HttpException(
          'Physical exploration already exists for this medical event',
          HttpStatus.CONFLICT,
        );
      }

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
    } catch (error) {
      throw new HttpException(
        'Error creating physical exploration',
        error.message,
      );
    }
  }
}
