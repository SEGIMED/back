import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { parsePaginationAndSorting } from 'src/utils/pagination.helper';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { medical_event } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendMedicalEventDto } from './dto/attend-medical-event.dto';
import { VitalSignsService } from '../modules/vital-signs/vital-signs.service';
import { PhysicalExplorationService } from '../modules/physical-exploration-data/physical-exploration/physical-exploration.service';
import { PhysicalExaminationService } from '../modules/physical-examination-data/physical-examination/physical-examination.service';

@Injectable()
export class MedicalEventsService {
  constructor(
    private prisma: PrismaService,
    private vitalSignsService: VitalSignsService,
    private physicalExplorationService: PhysicalExplorationService,
    private physicalExaminationService: PhysicalExaminationService,
  ) {}

  async createMedicalEvent(
    data: CreateMedicalEventDto,
    tenant_id: string,
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
          tenant_id: tenant_id,
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

  async attendMedicalEvent(
    attendMedicalEventDto: AttendMedicalEventDto,
    userId: string,
    tenant_id: string,
  ) {
    try {
      const {
        id,
        vital_signs,
        physical_explorations,
        physical_examinations,
        subcategory_cie_ids,
        main_diagnostic_cie,
        consultation_ended,
        ...basicData
      } = attendMedicalEventDto;

      // Ya no necesitamos obtener el tenant_id del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Obtener el evento médico
      const medicalEvent = await this.prisma.medical_event.findUnique({
        where: {
          id,
          deleted: false,
        },
        include: {
          appointment: true,
          physician: true,
          subcategory_medical_event: {
            include: {
              subcategories_cie_diez: true,
            },
          },
        },
      });

      if (!medicalEvent) {
        throw new NotFoundException('Evento médico no encontrado');
      }

      // Verificar que sea el médico asignado o un superadmin
      const isSuperAdmin = user.is_superadmin;
      const isAssignedPhysician = medicalEvent.physician.id === userId;

      if (!isSuperAdmin && !isAssignedPhysician) {
        throw new ForbiddenException(
          'No tiene permisos para atender esta consulta',
        );
      }

      // Verificar que la consulta no haya sido finalizada antes, o que esté dentro del período de gracia
      const appointmentFinished =
        medicalEvent.appointment.status === 'atendida';
      const gracePeriodValid = this._isWithinGracePeriod(
        medicalEvent.updated_at,
      );

      if (appointmentFinished && !gracePeriodValid && !isSuperAdmin) {
        throw new ForbiddenException(
          'La consulta ya fue atendida y ha pasado el período de gracia de 24 horas para modificarla',
        );
      }

      // Validar que main_diagnostic_cie esté en las subcategorías del evento
      if (main_diagnostic_cie) {
        const subcategoryCodes = medicalEvent.subcategory_medical_event.map(
          (subCat) => subCat.subcategories_cie_diez.code,
        );

        // Si hay subcategorías definidas, verificar que el diagnóstico principal sea una de ellas
        if (
          subcategoryCodes.length > 0 &&
          !subcategoryCodes.includes(main_diagnostic_cie)
        ) {
          throw new BadRequestException(
            'El diagnóstico principal debe ser una de las subcategorías CIE-10 asociadas al evento',
          );
        }
      }

      // Actualizar el evento médico en una transacción
      return await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar datos básicos del evento médico
        await tx.medical_event.update({
          where: { id },
          data: {
            ...basicData,
            main_diagnostic_cie,
            updated_at: new Date(),
          },
        });

        // 2. Actualizar signos vitales si se proporcionaron
        if (vital_signs && vital_signs.length > 0) {
          await this.vitalSignsService.create({
            patient_id: medicalEvent.patient_id,
            tenant_id,
            medical_event_id: id,
            vital_signs,
          });
        }

        // 3. Actualizar las subcategorías CIE-10 si se proporcionaron
        if (subcategory_cie_ids && subcategory_cie_ids.length > 0) {
          // Obtener las subcategorías actuales
          const currentSubcategories =
            await tx.subcategory_medical_event.findMany({
              where: { medical_eventId: id },
            });

          // Determinar subcategorías a eliminar
          const currentSubcategoryIds = currentSubcategories.map(
            (sub) => sub.subCategoryId,
          );
          const subcategoryIdsToDelete = currentSubcategoryIds.filter(
            (currentId) => !subcategory_cie_ids.includes(currentId),
          );

          // Determinar subcategorías a crear
          const subcategoryIdsToCreate = subcategory_cie_ids.filter(
            (newId) => !currentSubcategoryIds.includes(newId),
          );

          // Eliminar subcategorías que ya no están en la lista
          if (subcategoryIdsToDelete.length > 0) {
            await tx.subcategory_medical_event.deleteMany({
              where: {
                medical_eventId: id,
                subCategoryId: { in: subcategoryIdsToDelete },
              },
            });
          }

          // Crear nuevas subcategorías
          for (const subCategoryId of subcategoryIdsToCreate) {
            await tx.subcategory_medical_event.create({
              data: {
                medical_eventId: id,
                subCategoryId,
              },
            });
          }
        }

        // 4. Actualizar exploraciones físicas si se proporcionaron
        if (physical_explorations && physical_explorations.length > 0) {
          // La exploración física es única por evento médico, así que actualizamos o creamos una
          const exploration = physical_explorations[0]; // Tomamos la primera
          await this.physicalExplorationService.createPhysicalExploration({
            patient_id: medicalEvent.patient_id,
            physician_id: medicalEvent.physician_id,
            medical_event_id: id,
            tenant_id,
            description: exploration.description,
            physical_exploration_area_id:
              exploration.physical_exploration_area_id,
          });
        }

        // 5. Actualizar exámenes físicos si se proporcionaron
        if (physical_examinations && physical_examinations.length > 0) {
          // Transformar los datos para que sean compatibles con el servicio de examen físico
          const formattedExaminations = physical_examinations.map((exam) => ({
            patient_id: medicalEvent.patient_id,
            description: exam.description,
            medical_event_id: id,
            tenant_id,
            physical_subsystem_id: exam.physical_subsystem_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          await this.physicalExaminationService.create(formattedExaminations);
        }

        // 6. Si se indicó finalizar la consulta, actualizar el estado de la cita
        if (consultation_ended) {
          await tx.appointment.update({
            where: { id: medicalEvent.appointment_id },
            data: {
              status: 'atendida',
              updated_at: new Date(),
            },
          });
        }

        return {
          message: 'Consulta médica actualizada exitosamente',
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al atender consulta: ${error.message}`,
      );
    }
  }

  /**
   * Verifica si la fecha está dentro del período de gracia de 24 horas
   * @param date Fecha a verificar
   * @returns true si está dentro del período de gracia, false en caso contrario
   */
  private _isWithinGracePeriod(date: Date): boolean {
    const gracePeriodHours = 24;
    const now = new Date();
    const gracePeriodMs = gracePeriodHours * 60 * 60 * 1000;

    return now.getTime() - date.getTime() <= gracePeriodMs;
  }
}
