import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';

@Injectable()
export class MedicalEventsService {
  constructor(private prisma: PrismaService) {}

  private validatePagination(page: number, pageSize: number) {
    if (!Number.isInteger(page) || page <= 0) {
      throw new BadRequestException(
        'El parámetro "page" debe ser un número entero mayor que 0',
      );
    }

    if (!Number.isInteger(pageSize) || pageSize <= 0) {
      throw new BadRequestException(
        'El parámetro "pageSize" debe ser un número entero mayor que 0',
      );
    }

    return { page, pageSize };
  }

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
  }) {
    // Validamos los parámetros de paginado (si no se pasan, se asignan valores por defecto)
    const page = filters?.page ?? 1; // Página actual, por defecto 1
    const pageSize = filters?.pageSize ?? 10; // Tamaño de la página, por defecto 10

    // Llamamos a la función de validación
    const { page: validatedPage, pageSize: validatedPageSize } =
      this.validatePagination(page, pageSize);

    const skip = (validatedPage - 1) * validatedPageSize; // Desplazamiento calculado
    const take = validatedPageSize; // Limitar la cantidad de registros que se van a devolver

    try {
      const [medicalEvents, totalMedicalEvents] = await Promise.all([
        this.prisma.medicalEvent.findMany({
          where: {
            ...(filters?.patient_id && { patient_id: filters.patient_id }),
            ...(filters?.physician_id && {
              physician_id: filters.physician_id,
            }),
          },
          skip, // Desplazamiento
          take, // Limitar la cantidad
          orderBy: { appointment_id: 'asc' }, // Ordenar por appointment_id o el campo que consideres necesario
        }),
        this.prisma.medicalEvent.count({
          where: {
            ...(filters?.patient_id && { patient_id: filters.patient_id }),
            ...(filters?.physician_id && {
              physician_id: filters.physician_id,
            }),
          },
        }), // Contar el total de eventos médicos
      ]);

      const totalPages = Math.ceil(totalMedicalEvents / validatedPageSize); // Calcular el total de páginas

      return {
        data: medicalEvents,
        meta: {
          page: validatedPage,
          pageSize: validatedPageSize,
          totalPages,
          totalItems: totalMedicalEvents,
        },
      };
    } catch (error) {
      throw new Error(`Error al obtener eventos médicos: ${error.message}`);
    }
  }
}
