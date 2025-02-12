import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';

@Injectable()
export class PhysicalExplorationAreaService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExplorationArea(data: CreatePhysicalExplorationAreaDto) {
    try {
      const existingArea =
        await this.prisma.physical_exploration_area.findFirst({
          where: {
            OR: [
              { name_on_library: data.name_on_library },
              { name: data.name },
            ],
          },
        });

      if (existingArea) {
        throw new HttpException(
          'Physical exploration area with the same name or name_on_library already exist',
          400,
        );
      }
      return await this.prisma.physical_exploration_area.create({
        data,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating physical exploration area',
        error.status || 500,
      );
    }
  }
}
