import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationAreaDto } from './dto/create-physical-exploration-area.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhysicalExplorationAreaService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExplorationArea(
    data: CreatePhysicalExplorationAreaDto,
  ): Promise<{ message: string }> {
    try {
      const existingCount = await this.prisma.physical_exploration_area.count({
        where: {
          OR: [{ name_on_library: data.name_on_library }, { name: data.name }],
        },
      });

      if (existingCount > 0) {
        throw new BadRequestException(
          'A physical exploration area with the same name or name_on_library already exist',
        );
      }

      await this.prisma.physical_exploration_area.create({
        data,
      });

      return { message: 'Physical exploration area created successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        error.message || 'Error creating physical exploration area',
      );
    }
  }
}
