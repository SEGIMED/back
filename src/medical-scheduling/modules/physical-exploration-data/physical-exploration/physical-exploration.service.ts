import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhysicalExplorationDto } from './dto/create-physical-exploration.dto';
import { UpdatePhysicalExplorationDto } from './dto/update-physical-exploration.dto';

@Injectable()
export class PhysicalExplorationService {
  constructor(private prisma: PrismaService) {}

  async createPhysicalExploration(
    data: CreatePhysicalExplorationDto | UpdatePhysicalExplorationDto,
  ): Promise<{ message: string }> {
    try {
      const existingExploration =
        await this.prisma.physical_exploration.findFirst({
          where: {
            medical_event_id: data.medical_event_id,
          },
        });

      if (existingExploration) {
        const hasChanges = Object.keys(data).some(
          (key) =>
            data[key] !== undefined && data[key] !== existingExploration[key],
        );

        if (!hasChanges) {
          return {
            message:
              'No changes detected. Existing physical exploration remains unchanged',
          };
        }

        await this.prisma.physical_exploration.update({
          where: {
            id: existingExploration.id,
          },
          data: {
            ...existingExploration,
            ...Object.fromEntries(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              Object.entries(data).filter(([_, value]) => value !== undefined),
            ),
          },
        });
        return { message: 'Physical exploration updated successfully' };
      }

      const createData = data as CreatePhysicalExplorationDto;
      await this.prisma.physical_exploration.create({ data: createData });

      return { message: 'Physical exploration created successfully' };
    } catch (error) {
      throw new HttpException(
        'Error creating physical exploration',
        error.message,
      );
    }
  }
}
