import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class MedicalEventsService {
  constructor(private prisma: PrismaService) {}

  async createMedicalEvent(data: CreateMedicalEventDto) {
    return this.prisma.medicalEvent.create({
      data: {
        appointment_id: data.appointment_id,
        patient_id: data.patient_id,
        physician_id: data.physician_id,
        physician_comments: data.physician_comments ?? '',
        main_diagnostic_cie: data.main_diagnostic_cie ?? '',
        evolution: data.evolution ?? '',
        procedure: data.procedure ?? '',
        treatment: data.treatment ?? '',
        tenant_id: data.tenant_id,
      },
    });
  }

  async getMedicalEvents(filters?: {
    patient_id?: string;
    physician_id?: string;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }) {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(filters);

    try {
      const [medicalEvents, totalMedicalEvents] = await Promise.all([
        this.prisma.medicalEvent.findMany({
          where: {
            ...(filters?.patient_id && { patient_id: filters.patient_id }),
            ...(filters?.physician_id && {
              physician_id: filters.physician_id,
            }),
          },
          skip,
          take,
          orderBy: { [orderBy]: orderDirection },
        }),
        this.prisma.medicalEvent.count({
          where: {
            ...(filters?.patient_id && { patient_id: filters.patient_id }),
            ...(filters?.physician_id && {
              physician_id: filters.physician_id,
            }),
          },
        }),
      ]);

      const totalPages = Math.ceil(totalMedicalEvents / take);

      return {
        data: medicalEvents,
        meta: {
          page: filters.page || 1,
          pageSize: take,
          totalPages,
          totalItems: totalMedicalEvents,
        },
      };
    } catch (error) {
      throw new Error(`Error al obtener eventos médicos: ${error.message}`);
    }
  }
}
