import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { appointment, status_type } from '@prisma/client';
import * as moment from 'moment';
import { GroupBy, StatisticsType } from './dto/get-statistics.dto';

type AppointmentWithRelations = appointment & {
  patient: {
    name: string;
    last_name: string;
    email: string;
  };
  physician: {
    name: string;
    last_name: string;
  };
};

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // Helper method to convert HH:MM to minutes since midnight
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Method to check if the appointment is within physician's schedule
  private async isAppointmentInPhysicianSchedule(
    physicianId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<{ isAvailable: boolean; reason?: string }> {
    try {
      // Get the physician by user_id
      const physician = await this.prisma.physician.findFirst({
        where: {
          user_id: physicianId,
          tenant_id: tenantId,
          deleted: false,
        },
      });

      if (!physician) {
        return { isAvailable: false, reason: 'Médico no encontrado' };
      }

      const appointmentDate = moment(startDate).startOf('day');
      const dayOfWeek = appointmentDate.day(); // 0 = Sunday, 1 = Monday, etc.

      // Check if there's an exception for this date
      const exception =
        await this.prisma.physician_schedule_exception.findFirst({
          where: {
            physician_id: physician.id,
            date: {
              gte: appointmentDate.toDate(),
              lt: appointmentDate.clone().add(1, 'day').toDate(),
            },
            tenant_id: tenantId,
            deleted: false,
          },
        });

      // If there's an exception and the physician is not available, return false
      if (exception && !exception.is_available) {
        return {
          isAvailable: false,
          reason:
            exception.reason || 'El médico no está disponible en esta fecha',
        };
      }

      // Get the schedule for this day of the week
      const schedule = await this.prisma.physician_schedule.findFirst({
        where: {
          physician_id: physician.id,
          day_of_week: dayOfWeek,
          tenant_id: tenantId,
          deleted: false,
        },
      });

      // If there's no schedule for this day or it's marked as not a working day
      if (!schedule || !schedule.is_working_day) {
        return {
          isAvailable: false,
          reason: 'El médico no tiene horarios configurados para este día',
        };
      }

      // Check if appointment is within physician's working hours
      const startTime = moment(startDate);
      const endTime = moment(endDate);

      // Convert times to minutes for easier comparison
      const apptStartMinutes = startTime.hours() * 60 + startTime.minutes();
      const apptEndMinutes = endTime.hours() * 60 + endTime.minutes();
      const scheduleStartMinutes = this.timeToMinutes(schedule.start_time);
      const scheduleEndMinutes = this.timeToMinutes(schedule.end_time);

      // Check if appointment is within working hours
      if (
        apptStartMinutes < scheduleStartMinutes ||
        apptEndMinutes > scheduleEndMinutes
      ) {
        return {
          isAvailable: false,
          reason: 'La cita está fuera del horario de atención del médico',
        };
      }

      // Check if appointment is during rest period
      if (schedule.rest_start && schedule.rest_end) {
        const restStartMinutes = this.timeToMinutes(schedule.rest_start);
        const restEndMinutes = this.timeToMinutes(schedule.rest_end);

        // If appointment overlaps with rest period
        if (
          (apptStartMinutes >= restStartMinutes &&
            apptStartMinutes < restEndMinutes) ||
          (apptEndMinutes > restStartMinutes &&
            apptEndMinutes <= restEndMinutes) ||
          (apptStartMinutes < restStartMinutes &&
            apptEndMinutes > restEndMinutes)
        ) {
          return {
            isAvailable: false,
            reason: 'La cita coincide con el periodo de descanso del médico',
          };
        }
      }

      // Check appointment length
      const appointmentLengthMinutes = apptEndMinutes - apptStartMinutes;
      if (appointmentLengthMinutes !== schedule.appointment_length) {
        return {
          isAvailable: false,
          reason: `La duración de la cita debe ser de ${schedule.appointment_length} minutos`,
        };
      }

      // Check if there are too many simultaneous appointments
      if (schedule.simultaneous_slots > 1) {
        const existingAppointments = await this.prisma.appointment.count({
          where: {
            physician_id: physicianId,
            tenant_id: tenantId,
            deleted: false,
            status: { not: 'cancelada' },
            AND: [{ start: { lte: endDate } }, { end: { gte: startDate } }],
          },
        });

        if (existingAppointments >= schedule.simultaneous_slots) {
          return {
            isAvailable: false,
            reason:
              'El médico ya tiene el máximo de citas simultáneas para este horario',
          };
        }
      }

      return { isAvailable: true };
    } catch (error) {
      console.error('Error checking physician schedule:', error);
      return {
        isAvailable: false,
        reason: 'Error al verificar disponibilidad del médico',
      };
    }
  }

  // Method to validate if physician has the required specialty
  private async validatePhysicianSpecialty(
    physicianId: string,
    specialtyId: number,
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      // Check if the physician has the specified specialty
      const physicianSpecialty =
        await this.prisma.physician_speciality.findFirst({
          where: {
            physician: {
              user_id: physicianId,
              deleted: false,
            },
            speciality_id: specialtyId,
          },
          include: {
            speciality: {
              select: {
                name: true,
              },
            },
          },
        });

      if (!physicianSpecialty) {
        return {
          isValid: false,
          reason: 'El médico seleccionado no tiene la especialidad requerida',
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating physician specialty:', error);
      return {
        isValid: false,
        reason: 'Error al validar la especialidad del médico',
      };
    }
  }

  async createAppointment(
    data: CreateAppointmentDto,
    tenant: string,
  ): Promise<{ message: string }> {
    // Validaciones iniciales (fechas, paciente, médico, etc.)
    if (!data.start || !data.end || data.start >= data.end) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    try {
      // Asegurarnos de que las fechas se manejan correctamente
      // Guardamos explícitamente la fecha sin ajuste de zona horaria
      const startDate = moment(data.start).toDate();
      const endDate = moment(data.end).toDate();

      // Verificar existencia de entidades relacionadas
      const [patientExists, physicianExists, tenantExists] = await Promise.all([
        this.prisma.patient.findUnique({ where: { user_id: data.patient_id } }),
        this.prisma.physician.findUnique({
          where: { user_id: data.physician_id },
        }),
        this.prisma.tenant.findUnique({ where: { id: tenant } }),
      ]);

      if (!patientExists)
        throw new BadRequestException('El paciente no existe');
      if (!physicianExists)
        throw new BadRequestException('El médico no existe');
      if (!tenantExists) throw new BadRequestException('El tenant no existe');

      // Verificar si la cita está dentro del horario del médico
      const scheduleCheck = await this.isAppointmentInPhysicianSchedule(
        data.physician_id,
        startDate,
        endDate,
        tenant,
      );
      if (!scheduleCheck.isAvailable) {
        throw new BadRequestException(
          scheduleCheck.reason || 'El horario no está disponible',
        );
      }

      // Validar especialidad del médico si se proporciona
      if (data.specialty_id) {
        const specialtyCheck = await this.validatePhysicianSpecialty(
          data.physician_id,
          data.specialty_id,
        );

        if (!specialtyCheck.isValid) {
          throw new BadRequestException(
            specialtyCheck.reason ||
              'El médico no tiene la especialidad requerida',
          );
        }
      }

      // Verificar conflicto de horarios con otras citas
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          physician_id: data.physician_id,
          tenant_id: tenant,
          deleted: false,
          status: { not: 'cancelada' },
          AND: [{ start: { lt: endDate } }, { end: { gt: startDate } }],
        },
      });

      if (conflict) {
        throw new BadRequestException(
          'El médico ya tiene una cita en ese horario',
        );
      }

      // Transacción optimizada
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Crear cita médica
        const appointment = await prisma.appointment.create({
          data: {
            consultation_reason: data.consultation_reason,
            start: startDate,
            end: endDate,
            comments: data.comments,
            status: data.status || 'pendiente',
            tenant_id: tenant,
            patient_id: data.patient_id,
            physician_id: data.physician_id,
          },
        });

        // 2. Crear evento médico
        await prisma.medical_event.create({
          data: {
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
            physician_id: appointment.physician_id,
            tenant_id: appointment.tenant_id,
          },
        });

        return { message: 'Cita creada exitosamente' };
      });

      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }
  async getAppointmentsByUser(
    userId: string,
    params: { status?: status_type; specialty_id?: number } & PaginationParams,
  ): Promise<{ data: AppointmentWithRelations[]; total: number }> {
    // Desestructurar los parámetros de paginación y ordenación
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(params);

    try {
      // Construir filtros base
      const whereConditions: any = {
        OR: [{ patient_id: userId }, { physician_id: userId }],
        ...(params.status && { status: params.status }),
      };

      // Si se especifica especialidad, filtrar por médicos que tengan esa especialidad
      if (params.specialty_id) {
        whereConditions.physician = {
          physician_speciality: {
            some: {
              speciality_id: params.specialty_id,
            },
          },
        };
      }

      // Ejecutar consultas en paralelo para mejor performance
      const [appointments, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where: whereConditions,
          skip,
          take,
          orderBy: { [orderBy]: orderDirection },
          include: {
            patient: {
              select: {
                name: true,
                last_name: true,
                email: true,
              },
            },
            physician: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        }),
        this.prisma.appointment.count({
          where: whereConditions,
        }),
      ]);

      return {
        data: appointments,
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener las citas: ${error.message}`,
      );
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: status_type,
    reason?: string,
    tenant?: string,
  ): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id, tenant_id: tenant },
    });

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    if (status === 'cancelada' && !reason) {
      throw new Error('Se requiere una razón para cancelar la cita');
    }
    if (
      (appointment.status === 'pendiente' &&
        !['atendida', 'cancelada'].includes(status)) ||
      (appointment.status === 'atendida' && status !== 'cancelada') ||
      appointment.status === 'cancelada'
    ) {
      throw new Error(
        `Transición no permitida desde el estado ${appointment.status} a ${status}`,
      );
    }

    try {
      await this.prisma.appointment.update({
        where: { id },
        data: { status, cancelation_reason: reason || null },
      });

      return { message: `Estado de la cita actualizado a "${status}"` };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('Cita no encontrada');
      }
      throw new Error(`Error al actualizar la cita: ${error.message}`);
    }
  }
  async getPhysicianCalendar(
    physicianId: string,
    startDate?: string,
    endDate?: string,
    status?: status_type,
    tenantId?: string,
    month?: number,
    year?: number,
    specialtyId?: number,
  ) {
    try {
      let start: Date;
      let end: Date;

      // Si se proporcionan mes y año, configurar rango para ese mes
      if (month !== undefined && year !== undefined) {
        // Meses en JavaScript son 0-indexados (0-11), pero recibimos 1-12
        start = moment()
          .year(year)
          .month(month - 1)
          .startOf('month')
          .toDate();
        end = moment()
          .year(year)
          .month(month - 1)
          .endOf('month')
          .toDate();
      } else {
        // Usar fechas proporcionadas o valores predeterminados
        start = startDate
          ? new Date(startDate)
          : moment().startOf('week').toDate();

        end = endDate
          ? new Date(endDate)
          : moment(start).add(6, 'days').endOf('day').toDate();
      }

      // Obtener el médico correspondiente
      const physician = await this.prisma.physician.findFirst({
        where: {
          user_id: physicianId,
          tenant_id: tenantId,
          deleted: false,
        },
      });

      if (!physician) {
        throw new BadRequestException('Médico no encontrado');
      }

      // Validar especialidad del médico si se proporciona specialtyId
      if (specialtyId) {
        const specialtyCheck = await this.validatePhysicianSpecialty(
          physicianId,
          specialtyId,
        );

        if (!specialtyCheck.isValid) {
          throw new BadRequestException(
            specialtyCheck.reason ||
              'El médico no tiene la especialidad especificada',
          );
        }
      }

      // Buscar las citas del médico en el rango de fechas
      const appointments = await this.prisma.appointment.findMany({
        where: {
          physician_id: physicianId,
          tenant_id: tenantId,
          deleted: false,
          ...(status && { status }),
          start: { gte: start },
          end: { lte: end },
        },
        orderBy: { start: 'asc' },
      });

      // Obtener información de pacientes
      const patientIds = appointments.map((a) => a.patient_id);
      const patients = await this.prisma.user.findMany({
        where: {
          id: { in: patientIds },
        },
        select: {
          id: true,
          name: true,
          last_name: true,
        },
      });

      // Crear un mapa para acceso rápido a la información del paciente
      const patientMap = new Map();
      patients.forEach((patient) => {
        patientMap.set(patient.id, patient);
      });

      // Transformar datos para el calendario
      const calendarAppointments = appointments.map((appointment) => {
        const patient = patientMap.get(appointment.patient_id);
        const patientName = patient
          ? `${patient.name} ${patient.last_name || ''}`
          : 'Paciente';

        return {
          id: appointment.id,
          title: patientName,
          description: appointment.consultation_reason,
          start: appointment.start,
          end: appointment.end,
          status: appointment.status,
          comments: appointment.comments,
        };
      });

      // Obtener las excepciones en el mismo rango de fechas
      const exceptions =
        await this.prisma.physician_schedule_exception.findMany({
          where: {
            physician_id: physician.id,
            tenant_id: tenantId,
            deleted: false,
            date: {
              gte: start,
              lte: end,
            },
            is_available: false,
          },
        });

      // Agregar excepciones como eventos bloqueados
      const blockedEvents = exceptions.map((exception) => {
        const exceptionDate = moment(exception.date);
        return {
          id: `exception-${exception.id}`,
          title: 'No disponible',
          description: exception.reason || 'Día bloqueado',
          start: exceptionDate.startOf('day').toDate(),
          end: exceptionDate.endOf('day').toDate(),
          isException: true,
        };
      });

      return {
        appointments: calendarAppointments,
        blockedDays: blockedEvents,
        range: {
          start,
          end,
        },
      };
    } catch (error) {
      console.error('Error fetching physician calendar:', error);
      throw new InternalServerErrorException(
        `Error al obtener el calendario: ${error.message}`,
      );
    }
  }

  async getStatistics(
    type: StatisticsType,
    tenantId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      groupBy?: GroupBy;
      physicianId?: string;
      patientId?: string;
      specialtyId?: number;
      limit?: number;
      filter?: string;
    },
  ) {
    try {
      // Establecer fechas predeterminadas si no se proporcionan
      const start = options.startDate || moment().subtract(1, 'year').toDate();
      const end = options.endDate || moment().toDate();

      // Configurar un límite predeterminado
      const limit = options.limit || 10;

      // Configurar filtros base que se aplicarán a todas las consultas
      const baseFilters = {
        tenant_id: tenantId,
        deleted: false,
        ...(options.startDate && { start: { gte: start } }),
        ...(options.endDate && { end: { lte: end } }),
      };

      // Realizar diferentes consultas según el tipo de estadística solicitada
      switch (type) {
        case StatisticsType.APPOINTMENTS_BY_STATUS:
          return this.getAppointmentsByStatus(baseFilters);

        case StatisticsType.APPOINTMENTS_BY_DAY:
          return this.getAppointmentsByTimeUnit(baseFilters, 'day');

        case StatisticsType.APPOINTMENTS_BY_MONTH:
          return this.getAppointmentsByTimeUnit(baseFilters, 'month');

        case StatisticsType.APPOINTMENTS_BY_PHYSICIAN:
          return this.getAppointmentsByPhysician(baseFilters, limit);

        case StatisticsType.DIAGNOSES_DISTRIBUTION:
          return this.getDiagnosesDistribution(baseFilters, limit);

        case StatisticsType.CONSULTATIONS_COUNT:
          return this.getConsultationsCount(
            baseFilters,
            options.groupBy || GroupBy.MONTH,
          );

        case StatisticsType.PATIENT_DEMOGRAPHICS:
          return this.getPatientDemographics(tenantId);

        case StatisticsType.ATTENDANCE_RATE:
          return this.getAttendanceRate(
            baseFilters,
            options.groupBy || GroupBy.MONTH,
          );

        case StatisticsType.PHYSICIAN_WORKLOAD:
          return this.getPhysicianWorkload(baseFilters, options.physicianId);

        case StatisticsType.SCHEDULING_TRENDS:
          return this.getSchedulingTrends(
            baseFilters,
            options.groupBy || GroupBy.MONTH,
          );

        default:
          throw new BadRequestException(
            `Tipo de estadística no soportado: ${type}`,
          );
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new InternalServerErrorException(
        `Error al obtener estadísticas: ${error.message}`,
      );
    }
  }

  // Métodos auxiliares para cada tipo de estadística

  private async getAppointmentsByStatus(filters: any) {
    const statusCounts = await this.prisma.appointment.groupBy({
      by: ['status'],
      where: filters,
      _count: true,
    });

    return {
      data: statusCounts.map((item) => ({
        name: item.status,
        value: item._count,
      })),
      total: statusCounts.reduce((acc, curr) => acc + curr._count, 0),
    };
  }

  private async getAppointmentsByTimeUnit(filters: any, unit: 'day' | 'month') {
    // Obtener todas las citas que cumplen con los filtros
    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      select: {
        start: true,
        status: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    // Agrupar citas por unidad de tiempo
    const groupedAppointments = {};

    appointments.forEach((appointment) => {
      const date = moment(appointment.start);
      let key;

      if (unit === 'day') {
        key = date.format('YYYY-MM-DD');
      } else if (unit === 'month') {
        key = date.format('YYYY-MM');
      }

      if (!groupedAppointments[key]) {
        groupedAppointments[key] = {
          period: key,
          total: 0,
          atendida: 0,
          pendiente: 0,
          cancelada: 0,
        };
      }

      groupedAppointments[key].total += 1;
      groupedAppointments[key][appointment.status] += 1;
    });

    // Convertir objeto a array para la respuesta
    const result = Object.values(groupedAppointments);

    return {
      data: result,
      unit,
      total: appointments.length,
    };
  }

  private async getAppointmentsByPhysician(filters: any, limit: number) {
    const physicianResults = await this.prisma.$queryRaw`
      SELECT 
        u.id as physician_id, 
        u.name, 
        u.last_name, 
        COUNT(a.id) as total_appointments,
        COUNT(CASE WHEN a.status = 'atendida' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN a.status = 'cancelada' THEN 1 END) as cancelled_appointments
      FROM appointment a
      JOIN "user" u ON a.physician_id = u.id
      WHERE a.tenant_id = ${filters.tenant_id}
        AND a.deleted = false
        AND (${filters.start ? filters.start.gte : null} IS NULL OR a.start >= ${filters.start?.gte})
        AND (${filters.end ? filters.end.lte : null} IS NULL OR a.end <= ${filters.end?.lte})
      GROUP BY u.id, u.name, u.last_name
      ORDER BY total_appointments DESC
      LIMIT ${limit}
    `;

    // Convertir valores BigInt a Number
    const formattedResults = Array.isArray(physicianResults)
      ? physicianResults.map((item) => ({
          physician_id: item.physician_id,
          name: item.name,
          last_name: item.last_name,
          total_appointments: Number(item.total_appointments),
          completed_appointments: Number(item.completed_appointments),
          cancelled_appointments: Number(item.cancelled_appointments),
        }))
      : [];

    return {
      data: formattedResults,
      total: formattedResults.length,
    };
  }

  private async getDiagnosesDistribution(filters: any, limit: number) {
    // Obtener las citas que cumplen con los filtros
    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      select: {
        id: true,
      },
    });

    if (appointments.length === 0) {
      return {
        data: [],
        total: 0,
      };
    }

    const appointmentIds = appointments.map((a) => a.id);

    // En lugar de pasar el array directamente, creamos una consulta que sea segura
    // para cualquier cantidad de IDs
    const placeholders = appointmentIds.map((_, i) => `$${i + 1}`).join(',');

    // Convertimos los IDs en cadenas para la consulta
    const appointmentIdsStrings = appointmentIds.map((id) => id.toString());

    const diagnosesData = await this.prisma.$queryRawUnsafe(
      `
      SELECT 
        s.code,
        s.description,
        COUNT(sme.id) as count
      FROM medical_event me
      JOIN subcategory_medical_event sme ON me.id = sme."medical_eventId"
      JOIN subcategories_cie_diez s ON sme."subCategoryId" = s.id
      WHERE me.appointment_id IN (${placeholders})
      GROUP BY s.code, s.description
      ORDER BY count DESC
      LIMIT ${limit}
    `,
      ...appointmentIdsStrings,
    );

    // Convertir BigInt a Number en los resultados
    const formattedData = Array.isArray(diagnosesData)
      ? diagnosesData.map((item) => ({
          code: item.code,
          description: item.description,
          count: Number(item.count), // Convertir explícitamente BigInt a Number
        }))
      : [];

    return {
      data: formattedData,
      total: formattedData.reduce((acc, curr) => acc + curr.count, 0),
    };
  }

  private async getConsultationsCount(filters: any, groupBy: GroupBy) {
    let format: string;
    let groupField: string;

    switch (groupBy) {
      case GroupBy.DAY:
        format = 'YYYY-MM-DD';
        groupField = 'date';
        break;
      case GroupBy.WEEK:
        format = 'YYYY-[W]WW';
        groupField = 'week';
        break;
      case GroupBy.MONTH:
        format = 'YYYY-MM';
        groupField = 'month';
        break;
      case GroupBy.QUARTER:
        format = 'YYYY-[Q]Q';
        groupField = 'quarter';
        break;
      case GroupBy.YEAR:
        format = 'YYYY';
        groupField = 'year';
        break;
      default:
        format = 'YYYY-MM';
        groupField = 'month';
    }

    // Obtener citas
    const appointments = await this.prisma.appointment.findMany({
      where: {
        ...filters,
        status: 'atendida', // Solo citas completadas
      },
      select: {
        start: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    // Agrupar por la unidad de tiempo seleccionada
    const grouped = {};

    appointments.forEach((appointment) => {
      const date = moment(appointment.start);
      const key = date.format(format);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          count: 0,
        };
      }

      grouped[key].count += 1;
    });

    // Convertir a array y ordenar por período
    const result = Object.values(grouped).sort((a: any, b: any) =>
      a.period.localeCompare(b.period),
    );

    return {
      data: result,
      groupBy: groupField,
      total: appointments.length,
    };
  }

  private async getPatientDemographics(tenantId: string) {
    // Obtener distribución por género
    const genderDistribution = await this.prisma.$queryRaw`
      SELECT 
        COALESCE(u.gender, 'No especificado') as gender,
        COUNT(u.id) as count
      FROM "user" u
      WHERE u.tenant_id = ${tenantId}
        AND u.deleted = false
        AND u.role = 'patient'
      GROUP BY u.gender
    `;

    // Obtener distribución por edad
    const ageDistribution = await this.prisma.$queryRaw`
      SELECT 
        CASE
          WHEN EXTRACT(YEAR FROM AGE(NOW(), u.birth_date)) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), u.birth_date)) BETWEEN 18 AND 30 THEN '18-30'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), u.birth_date)) BETWEEN 31 AND 45 THEN '31-45'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), u.birth_date)) BETWEEN 46 AND 60 THEN '46-60'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), u.birth_date)) > 60 THEN '60+'
          ELSE 'Sin datos'
        END as age_group,
        COUNT(u.id) as count
      FROM "user" u
      WHERE u.tenant_id = ${tenantId}
        AND u.deleted = false
        AND u.role = 'patient'
      GROUP BY age_group
      ORDER BY age_group
    `;

    // Convertir valores BigInt a Number
    const formattedGenderDistribution = Array.isArray(genderDistribution)
      ? genderDistribution.map((item) => ({
          gender: item.gender,
          count: Number(item.count),
        }))
      : [];

    const formattedAgeDistribution = Array.isArray(ageDistribution)
      ? ageDistribution.map((item) => ({
          age_group: item.age_group,
          count: Number(item.count),
        }))
      : [];

    return {
      gender: formattedGenderDistribution,
      age: formattedAgeDistribution,
    };
  }

  private async getAttendanceRate(filters: any, groupBy: GroupBy) {
    let format: string;

    switch (groupBy) {
      case GroupBy.DAY:
        format = 'YYYY-MM-DD';
        break;
      case GroupBy.WEEK:
        format = 'YYYY-[W]WW';
        break;
      case GroupBy.MONTH:
        format = 'YYYY-MM';
        break;
      case GroupBy.QUARTER:
        format = 'YYYY-[Q]Q';
        break;
      case GroupBy.YEAR:
        format = 'YYYY';
        break;
      default:
        format = 'YYYY-MM';
    }

    // Obtener citas
    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      select: {
        start: true,
        status: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    // Agrupar por la unidad de tiempo seleccionada
    const grouped = {};

    appointments.forEach((appointment) => {
      const date = moment(appointment.start);
      const key = date.format(format);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          total: 0,
          attended: 0,
          cancelled: 0,
          pending: 0,
          attendanceRate: 0,
        };
      }

      grouped[key].total += 1;

      if (appointment.status === 'atendida') {
        grouped[key].attended += 1;
      } else if (appointment.status === 'cancelada') {
        grouped[key].cancelled += 1;
      } else if (appointment.status === 'pendiente') {
        grouped[key].pending += 1;
      }
    });

    // Calcular tasas de asistencia
    Object.values(grouped).forEach((period: any) => {
      // Excluir pendientes del cálculo de tasa
      const completedAppointments = period.attended + period.cancelled;
      period.attendanceRate =
        completedAppointments > 0
          ? (period.attended / completedAppointments) * 100
          : 0;
    });

    // Convertir a array y ordenar por período
    const result = Object.values(grouped).sort((a: any, b: any) =>
      a.period.localeCompare(b.period),
    );

    return {
      data: result,
      groupBy,
      total: appointments.length,
    };
  }

  private async getPhysicianWorkload(filters: any, physicianId?: string) {
    // Si se proporciona un médico específico, agregar al filtro
    if (physicianId) {
      filters = {
        ...filters,
        physician_id: physicianId,
      };
    }

    // Obtener estadísticas de carga de trabajo por día de la semana
    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      select: {
        start: true,
        end: true,
        status: true,
        physician_id: true,
      },
    });

    // Organizar datos por día de la semana y por médico
    const workloadByDayOfWeek = {
      0: { day: 'Domingo', count: 0, minutes: 0 },
      1: { day: 'Lunes', count: 0, minutes: 0 },
      2: { day: 'Martes', count: 0, minutes: 0 },
      3: { day: 'Miércoles', count: 0, minutes: 0 },
      4: { day: 'Jueves', count: 0, minutes: 0 },
      5: { day: 'Viernes', count: 0, minutes: 0 },
      6: { day: 'Sábado', count: 0, minutes: 0 },
    };

    const workloadByPhysician = {};

    appointments.forEach((appointment) => {
      // Solo considerar citas atendidas para los cálculos de carga
      if (appointment.status === 'atendida') {
        const dayOfWeek = moment(appointment.start).day();
        const duration = moment(appointment.end).diff(
          moment(appointment.start),
          'minutes',
        );

        // Acumular por día de semana
        workloadByDayOfWeek[dayOfWeek].count += 1;
        workloadByDayOfWeek[dayOfWeek].minutes += duration;

        // Acumular por médico
        if (!workloadByPhysician[appointment.physician_id]) {
          workloadByPhysician[appointment.physician_id] = {
            physician_id: appointment.physician_id,
            count: 0,
            minutes: 0,
          };
        }

        workloadByPhysician[appointment.physician_id].count += 1;
        workloadByPhysician[appointment.physician_id].minutes += duration;
      }
    });

    // Convertir a arrays
    const daysOfWeek = Object.values(workloadByDayOfWeek);
    const physicians = Object.values(workloadByPhysician);

    // Obtener información adicional de los médicos
    if (physicians.length > 0) {
      const physicianIds = physicians.map((p: any) => p.physician_id);
      const physicianData = await this.prisma.user.findMany({
        where: {
          id: { in: physicianIds },
        },
        select: {
          id: true,
          name: true,
          last_name: true,
        },
      });

      // Agregar nombres a los resultados
      physicians.forEach((physician: any) => {
        const data = physicianData.find((p) => p.id === physician.physician_id);
        if (data) {
          physician.name = `${data.name} ${data.last_name || ''}`;
        }
      });
    }

    return {
      byDayOfWeek: daysOfWeek,
      byPhysician: physicians,
      total: {
        appointments: appointments.filter((a) => a.status === 'atendida')
          .length,
        minutes: appointments
          .filter((a) => a.status === 'atendida')
          .reduce(
            (acc, curr) =>
              acc + moment(curr.end).diff(moment(curr.start), 'minutes'),
            0,
          ),
      },
    };
  }

  private async getSchedulingTrends(filters: any, groupBy: GroupBy) {
    let format: string;

    switch (groupBy) {
      case GroupBy.DAY:
        format = 'YYYY-MM-DD';
        break;
      case GroupBy.WEEK:
        format = 'YYYY-[W]WW';
        break;
      case GroupBy.MONTH:
        format = 'YYYY-MM';
        break;
      default:
        format = 'YYYY-MM';
    }

    // Obtener citas con su fecha de creación
    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      select: {
        created_at: true,
        start: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Agrupar por la unidad de tiempo seleccionada
    const grouped = {};

    appointments.forEach((appointment) => {
      const creationDate = moment(appointment.created_at);
      const key = creationDate.format(format);

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          count: 0,
          advanceBookingDays: 0, // Días promedio de anticipación en la reserva
        };
      }

      // Contar cita
      grouped[key].count += 1;

      // Calcular días de anticipación
      const appointmentDate = moment(appointment.start);
      const daysInAdvance = appointmentDate.diff(creationDate, 'days');
      grouped[key].advanceBookingDays += daysInAdvance;
    });

    // Calcular promedios
    Object.values(grouped).forEach((period: any) => {
      if (period.count > 0) {
        period.advanceBookingDays =
          Math.round((period.advanceBookingDays / period.count) * 10) / 10;
      }
    });

    // Convertir a array y ordenar por período
    const result = Object.values(grouped).sort((a: any, b: any) =>
      a.period.localeCompare(b.period),
    );

    return {
      data: result,
      groupBy,
      total: appointments.length,
    };
  }
}
