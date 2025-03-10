import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BackgroundService {
  constructor(private prisma: PrismaService) {}

  async createBackground(data: CreateBackgroundDto) {
    try {
      const backgroundCount = await this.prisma.background.count({
        where: {
          patient_id: data.patient_id,
        },
      });

      if (backgroundCount > 0) {
        throw new BadRequestException(
          'Background already exists for this patient',
        );
      }

      await this.prisma.background.create({
        data: {
          ...data,
        },
      });

      return { message: 'Background created successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        error.message || 'Error creating background',
      );
    }
  }
}
