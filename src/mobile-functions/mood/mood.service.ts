import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class MoodService {
  constructor(private prisma: PrismaService) {}

  async createMoodEntry(
    userId: string,
    tenantId: string,
    createMoodDto: CreateMoodDto,
  ) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const existingMoodEntry = await this.prisma.mood_entry.findFirst({
      where: {
        patient_id: userId,
        created_at: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    if (existingMoodEntry) {
      throw new ConflictException(
        'Ya has registrado tu estado de ánimo hoy. Solo puedes registrar un estado de ánimo por día.',
      );
    }

    // Crear el nuevo registro
    const moodEntry = await this.prisma.mood_entry.create({
      data: {
        patient_id: userId,
        tenant_id: tenantId,
        mood_level: createMoodDto.mood_level,
      },
    });

    return {
      id: moodEntry.id,
      mood_level: moodEntry.mood_level,
      created_at: moodEntry.created_at,
      message: '¡Gracias por contarnos cómo te sientes hoy!',
    };
  }

  async getTodayMoodEntry(userId: string) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const moodEntry = await this.prisma.mood_entry.findFirst({
      where: {
        patient_id: userId,
        created_at: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!moodEntry) {
      throw new NotFoundException('No has registrado tu estado de ánimo hoy.');
    }

    return {
      id: moodEntry.id,
      mood_level: moodEntry.mood_level,
      created_at: moodEntry.created_at,
    };
  }

  async getMoodHistory(userId: string) {
    const moodEntries = await this.prisma.mood_entry.findMany({
      where: {
        patient_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return moodEntries;
  }
}
