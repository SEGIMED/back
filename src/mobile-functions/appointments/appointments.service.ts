import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NextAppointmentResponseDto,
  AllAppointmentsResponseDto,
  AppointmentDto,
  GroupedAppointmentsDto,
} from './dto/mobile-appointments-response.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

@Injectable()
export class MobileAppointmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene los tenant IDs del paciente de forma optimizada
   */
  private async getPatientTenantIds(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<string[]> {
    // Si los tenants vienen del JWT, usarlos directamente
    if (userTenants && userTenants.length > 0) {
      return userTenants.map((tenant) => tenant.id);
    }

    // Sino, buscar en la DB con el patient_id directamente
    const patientTenants = await this.prisma.patient_tenant.findMany({
      where: {
        patient: {
          user_id: patientId,
        },
        deleted: false,
      },
      select: { tenant_id: true },
    });    return patientTenants.map((pt) => pt.tenant_id);
  }

  /**
   * Obtiene el próximo turno pendiente del paciente según sus tenants asociados
   */
  async getNextAppointment(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
    specialtyId?: number,
  ): Promise<NextAppointmentResponseDto> {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      if (tenantIds.length === 0) {
        return {
          next_appointment: undefined,
          message: 'No se encontraron organizaciones asociadas al paciente',
        };
      }

      // Construir filtros base
      const whereConditions: any = {
        patient_id: patientId,
        tenant_id: { in: tenantIds },
        status: 'pendiente',
        start: { gte: new Date() },
        deleted: false,
      };

      // Si se especifica especialidad, filtrar por médicos que tengan esa especialidad
      if (specialtyId) {
        whereConditions.physician = {
          physician_speciality: {
            some: {
              speciality_id: specialtyId,
            },
          },
        };
      }

      // Buscar el próximo turno pendiente
      const nextAppointment = await this.prisma.appointment.findFirst({
        where: whereConditions,
        orderBy: { start: 'asc' },
        select: {
          id: true,
          start: true,
          status: true,
          physician: {
            select: {
              id: true,
              name: true,
              last_name: true,
              image: true,
            },
          },
        },
      });

      if (!nextAppointment) {
        const message = specialtyId 
          ? 'No se encontraron citas pendientes para la especialidad especificada'
          : 'No se encontraron citas pendientes';
        return {
          next_appointment: undefined,
          message,
        };
      }

      // Obtener especialidad del médico en una consulta optimizada con los datos preexistentes
      const physicianInfo = await this.prisma.physician.findUnique({
        where: { user_id: nextAppointment.physician.id },
        select: {
          physician_speciality: {
            select: {
              speciality: {
                select: {
                  name: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      const specialty =
        physicianInfo?.physician_speciality?.[0]?.speciality?.name ||
        'Medicina General';

      const formattedAppointment = {
        id: nextAppointment.id,
        start: nextAppointment.start,
        status: nextAppointment.status,
        physician: {
          id: nextAppointment.physician.id,
          name: nextAppointment.physician.name,
          last_name: nextAppointment.physician.last_name,
          image: nextAppointment.physician.image,
          specialty: specialty,
        },
      };

      return {
        next_appointment: formattedAppointment,
        message: 'Próxima cita encontrada exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener el próximo turno: ${error.message}`,      );
    }
  }

  /**
   * Obtiene todos los turnos del paciente agrupados entre pendientes y pasados
   */
  async getAllAppointments(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
    specialtyId?: number,
  ): Promise<AllAppointmentsResponseDto> {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      if (tenantIds.length === 0) {
        const emptyResponse: GroupedAppointmentsDto = {
          pending: [],
          past: [],
          pending_count: 0,
          past_count: 0,
        };
        return {
          appointments: emptyResponse,
          message: 'No se encontraron organizaciones asociadas al paciente',
        };
      }

      // Construir filtros base
      const whereConditions: any = {
        patient_id: patientId,
        tenant_id: { in: tenantIds },
        deleted: false,
      };

      // Si se especifica especialidad, filtrar por médicos que tengan esa especialidad
      if (specialtyId) {
        whereConditions.physician = {
          physician_speciality: {
            some: {
              speciality_id: specialtyId,
            },
          },
        };
      }

      // Obtener todas las citas del paciente
      const allAppointments = await this.prisma.appointment.findMany({
        where: whereConditions,
        orderBy: { start: 'desc' },
        select: {
          id: true,
          start: true,
          status: true,
          physician: {
            select: {
              id: true,
              name: true,
              last_name: true,
              image: true,
            },
          },
        },
      });

      // Obtener especialidades de médicos únicos en batch para optimizar
      const uniquePhysicianIds = [
        ...new Set(allAppointments.map((apt) => apt.physician.id)),
      ];
      const physiciansSpecialties = await this.prisma.physician.findMany({
        where: {
          user_id: { in: uniquePhysicianIds },
        },
        select: {
          user_id: true,
          physician_speciality: {
            select: {
              speciality: {
                select: {
                  name: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      // Crear mapa de especialidades
      const specialtyMap = new Map();
      physiciansSpecialties.forEach((physician) => {
        const specialty =
          physician.physician_speciality?.[0]?.speciality?.name ||
          'Medicina General';
        specialtyMap.set(physician.user_id, specialty);
      });

      // Agrupar las citas entre pendientes y pasadas
      const now = new Date();
      const pending: AppointmentDto[] = [];
      const past: AppointmentDto[] = [];

      allAppointments.forEach((appointment) => {
        const specialty =
          specialtyMap.get(appointment.physician.id) || 'Medicina General';

        const formattedAppointment: AppointmentDto = {
          id: appointment.id,
          start: appointment.start,
          status: appointment.status,
          physician: {
            id: appointment.physician.id,
            name: appointment.physician.name,
            last_name: appointment.physician.last_name,
            image: appointment.physician.image,
            specialty: specialty,
          },
        };

        if (appointment.status === 'pendiente' && appointment.start >= now) {
          pending.push(formattedAppointment);
        } else {
          past.push(formattedAppointment);
        }
      });

      // Ordenar: pendientes por fecha ascendente, pasadas por fecha descendente
      pending.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );      past.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
      );

      const groupedAppointments: GroupedAppointmentsDto = {
        pending,
        past,
        pending_count: pending.length,
        past_count: past.length,
      };

      const message = specialtyId 
        ? 'Citas filtradas por especialidad obtenidas exitosamente'
        : 'Citas obtenidas exitosamente';

      return {
        appointments: groupedAppointments,
        message,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener las citas: ${error.message}`,
      );
    }
  }

  /**
   * Cancela una cita del paciente
   */
  async cancelAppointment(
    appointmentId: string,
    patientId: string,
    cancelDto: CancelAppointmentDto,
    userTenants?: { id: string; name: string; type: string }[],
  ) {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      // Verificar que la cita existe y pertenece al paciente
      const appointment = await this.prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patient_id: patientId,
          tenant_id: { in: tenantIds },
          deleted: false,
        },
        include: {
          physician: {
            select: {
              name: true,
              last_name: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new NotFoundException(
          'Cita no encontrada o no tienes permisos para cancelarla',
        );
      }

      // Verificar que la cita esté pendiente
      if (appointment.status !== 'pendiente') {
        throw new BadRequestException(
          'Solo se pueden cancelar citas pendientes',
        );
      }

      // Verificar que la cita sea futura
      const now = new Date();
      if (appointment.start <= now) {
        throw new BadRequestException('No se pueden cancelar citas pasadas');
      }

      // Actualizar el estado de la cita a cancelada
      const updatedAppointment = await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'cancelada',
          // Usar el campo correcto para la razón de cancelación
          ...(cancelDto.reason && { cancelation_reason: cancelDto.reason }),
        },
        include: {
          physician: {
            select: {
              name: true,
              last_name: true,
            },
          },
        },
      });

      return {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        start: updatedAppointment.start,
        physician: {
          name: updatedAppointment.physician.name,
          last_name: updatedAppointment.physician.last_name,
        },
        message: 'Cita cancelada exitosamente',
        cancelled_reason: cancelDto.reason,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al cancelar la cita: ${error.message}`,
      );
    }
  }
}
