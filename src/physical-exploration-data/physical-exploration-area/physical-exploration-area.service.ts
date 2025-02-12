import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';

@Injectable()
export class PhysicalExplorationAreaService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExplorationArea(data: CreatePhysicalExplorationAreaDto) {
    try {
      return await this.prisma.physical_exploration_area.create({
        data,
      });
    } catch (error) {
      throw new HttpException(
        'Error creating physical exploration area',
        error.message,
      );
    }
  }
}
