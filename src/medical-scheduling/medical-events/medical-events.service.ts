import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { parsePaginationAndSorting } from 'src/utils/pagination.helper';
import { medical_event } from '@prisma/client';

@Injectable()
export class MedicalEventsService {
  constructor(private prisma: PrismaService) {}

  async createMedicalEvent(
    data: CreateMedicalEventDto,
  ): Promise<{ message: string }> {
    try {
      await this.prisma.medical_event.create({
        data: {
          appointment_id: data.appointment_id,
          patient_id: data.patient_id,
          physician_id: data.physician_id,
          physician_comments: data.physician_comments ?? '',
          main_diagnostic_cie: data.main_diagnostic_cie ?? '',
          evolution: data.evolution ?? '',
          procedure: data.procedure ?? '',
          treatment: data.treatment ?? '',
        },
      });

      return { message: `Evento médico creado exitosamente` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el evento médico: ${error.message}`,
      );
    }
  }

  async getMedicalEvents(filters?: {
    patient_id?: string;
    physician_id?: string;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<medical_event[]> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(filters);

    try {
      const medicalEvents = await this.prisma.medical_event.findMany({
        where: {
          ...(filters?.patient_id && { patient_id: filters.patient_id }),
          ...(filters?.physician_id && { physician_id: filters.physician_id }),
        },
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      });

      return medicalEvents;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los eventos médicos',
        error.message,
      );
    }
  }
}
