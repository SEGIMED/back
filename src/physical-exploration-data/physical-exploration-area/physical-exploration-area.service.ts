import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhysicalExplorationAreaService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExplorationArea(data: CreatePhysicalExplorationAreaDto) {
    if (!data.name || !data.name_on_library) {
      throw new HttpException(
        'Name and name_on_library are required fields',
        400,
      );
    }

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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(`Database error: ${error.message}`, 500);
      }
      throw new HttpException(
        error.message || 'Error creating physical exploration area',
        error.status || 500,
      );
    }
  }
}
