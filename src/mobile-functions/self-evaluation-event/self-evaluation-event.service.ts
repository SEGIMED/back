import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSelfEvaluationEventDto } from './dto/create-self-evaluation-event.dto';
import { CreateMobileSelfEvaluationDto } from './dto/create-self-evaluation-event.dto';
import { VitalSignsService } from '../../medical-scheduling/modules/vital-signs/vital-signs.service';
import {
  LatestVitalSignsResponseDto,
  LatestVitalSignDto,
} from './dto/latest-vital-signs-response.dto';
import {
  VitalSignHistoryResponseDto,
  MonthlyStatsDto,
  WeekDataDto,
  DayDataDto,
} from './dto/vital-sign-history-response.dto';

@Injectable()
export class SelfEvaluationEventService {
  constructor(
    private prisma: PrismaService,
    private vitalSignsService: VitalSignsService,
  ) {}

  /**
   * Crea un evento de autoevaluación con sus signos vitales asociados
   * @param createSelfEvaluationEventDto Datos para crear el evento
   */
  async create(createSelfEvaluationEventDto: CreateSelfEvaluationEventDto) {
    const { patient_id, medical_event_id, vital_signs } =
      createSelfEvaluationEventDto;

    try {
      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patient_id },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Verificar que el evento médico existe y pertenece al paciente
      const medicalEvent = await this.prisma.medical_event.findUnique({
        where: { id: medical_event_id },
        include: {
          patient: true,
        },
      });

      if (!medicalEvent) {
        throw new NotFoundException('Evento médico no encontrado');
      }

      if (medicalEvent.patient_id !== patient.patient.id) {
        throw new BadRequestException(
          'El paciente no coincide con el evento médico',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const selfEvaluationEvent = await tx.self_evaluation_event.create({
          data: {
            patient_id,
            medical_event_id,
          },
        });

        // Crear los signos vitales asociados
        if (vital_signs && vital_signs.length > 0) {
          await this.vitalSignsService.create({
            patient_id,
            self_evaluation_event_id: selfEvaluationEvent.id,
            vital_signs,
          });
        }

        // Obtener el evento completo con los signos vitales
        return await tx.self_evaluation_event.findUnique({
          where: { id: selfEvaluationEvent.id },
          include: {
            vital_signs: {
              include: {
                vital_sign: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear evento de autoevaluación: ${error.message}`,
      );
    }
  }

  /**
   * Crea una autoevaluación móvil con signos vitales propios del paciente
   * Este método no requiere medical_event_id ni tenant_id ya que son signos vitales independientes
   * @param patientId ID del paciente extraído del JWT
   * @param createMobileSelfEvaluationDto Datos de signos vitales
   */
  async createMobileSelfEvaluation(
    patientId: string,
    createMobileSelfEvaluationDto: CreateMobileSelfEvaluationDto,
  ) {
    try {
      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patientId },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      const { vital_signs } = createMobileSelfEvaluationDto;

      return this.prisma.$transaction(async (tx) => {
        // Crear el evento de autoevaluación sin medical_event_id ni tenant_id
        // Esto representa signos vitales propios del paciente, no de una consulta médica
        const selfEvaluationEvent = await tx.self_evaluation_event.create({
          data: {
            patient_id: patientId,
            medical_event_id: null, // Campo opcional para autoevaluaciones
            tenant_id: null, // Campo opcional para signos vitales propios del paciente
          },
        });
        console.log('selfEvaluationEvent', selfEvaluationEvent);
        // Crear los signos vitales asociados directamente en la transacción
        if (vital_signs && vital_signs.length > 0) {
          for (const vs of vital_signs) {
            await tx.vital_signs.create({
              data: {
                patient_id: patientId,
                self_evaluation_event_id: selfEvaluationEvent.id,
                vital_sign_id: vs.vital_sign_id,
                measure: vs.measure,
                // tenant_id se omite (queda como null para signos vitales propios del paciente)
              },
            });
          }
        }

        // Obtener el evento completo con los signos vitales
        const result = await tx.self_evaluation_event.findUnique({
          where: { id: selfEvaluationEvent.id },
          include: {
            vital_signs: {
              include: {
                vital_sign: {
                  include: {
                    cat_measure_unit: true,
                  },
                },
              },
            },
          },
        });

        return {
          id: result.id,
          patient_id: result.patient_id,
          medical_event_id: result.medical_event_id,
          created_at: result.created_at,
          vital_signs: result.vital_signs.map((vs) => ({
            id: vs.id,
            measure: vs.measure,
            vital_sign_name: vs.vital_sign.name,
            measure_unit: vs.vital_sign.cat_measure_unit?.name,
            created_at: vs.created_at,
          })),
          message: 'Signos vitales registrados exitosamente',
        };
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al registrar signos vitales: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el último registro de todos los signos vitales del catálogo para un paciente
   * @param patientId ID del paciente
   * @returns Array con el último valor de cada tipo de signo vital del catálogo
   */
  async getLatestVitalSignsForAllCatalog(
    patientId: string,
  ): Promise<LatestVitalSignsResponseDto> {
    try {
      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patientId },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Obtener todos los tipos de signos vitales del catálogo
      const vitalSignsCatalog = await this.prisma.cat_vital_signs.findMany({
        include: {
          cat_measure_unit: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      const latestVitalSigns: LatestVitalSignDto[] = [];

      // Para cada tipo de signo vital del catálogo, buscar el registro más reciente
      for (const catalogItem of vitalSignsCatalog) {
        // NOTA: No filtramos por tenant_id intencionalmente
        // Los signos vitales propios del paciente (self-evaluation) no tienen tenant_id
        // y deben ser incluidos junto con los de consultas médicas
        const latestRecord = await this.prisma.vital_signs.findFirst({
          where: {
            patient_id: patientId,
            vital_sign_id: catalogItem.id,
            deleted: false,
          },
          orderBy: {
            created_at: 'desc',
          },
          include: {
            vital_sign: {
              include: {
                cat_measure_unit: true,
              },
            },
          },
        });

        // Preparar la información del catálogo (excluyendo specialties como se especifica)
        const vitalSignCatalogInfo = {
          id: catalogItem.id,
          name: catalogItem.name,
          category: catalogItem.category,
          color: catalogItem.color,
          mini_icon: catalogItem.mini_icon,
          icon: catalogItem.icon,
          background_icon: catalogItem.background_icon,
          normal_min_value: catalogItem.normal_min_value,
          normal_max_value: catalogItem.normal_max_value,
          slightly_high_value: catalogItem.slightly_high_value,
          high_max_value: catalogItem.high_max_value,
          critical_max_value: catalogItem.critical_max_value,
        };

        if (latestRecord) {
          // Si se encontró un registro, incluir los datos
          latestVitalSigns.push({
            vital_sign: vitalSignCatalogInfo,
            measure: latestRecord.measure,
            created_at: latestRecord.created_at,
            cat_measure_unit: catalogItem.cat_measure_unit
              ? {
                  id: catalogItem.cat_measure_unit.id,
                  name: catalogItem.cat_measure_unit.name,
                  description: catalogItem.cat_measure_unit.description,
                }
              : undefined,
          });
        } else {
          // Si no se encontró registro, marcar como "Sin datos"
          latestVitalSigns.push({
            vital_sign: vitalSignCatalogInfo,
            measure: 'Sin datos',
            created_at: undefined,
            cat_measure_unit: catalogItem.cat_measure_unit
              ? {
                  id: catalogItem.cat_measure_unit.id,
                  name: catalogItem.cat_measure_unit.name,
                  description: catalogItem.cat_measure_unit.description,
                }
              : undefined,
          });
        }
      }

      return {
        data: latestVitalSigns,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener los últimos signos vitales: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene el historial y analítica de un signo vital específico para un mes determinado
   * @param patientId ID del paciente
   * @param vitalSignTypeId ID del tipo de signo vital del catálogo
   * @param month Mes en formato YYYY-MM
   * @returns Historial detallado con estadísticas mensuales y datos semanales
   */
  async getVitalSignHistory(
    patientId: string,
    vitalSignTypeId: number,
    month: string,
  ): Promise<VitalSignHistoryResponseDto> {
    try {
      // Validar formato del mes
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        throw new BadRequestException(
          'El formato del mes debe ser YYYY-MM (ej. 2023-10)',
        );
      }

      // Verificar que el paciente existe
      const patient = await this.prisma.user.findUnique({
        where: { id: patientId },
        include: { patient: true },
      });

      if (!patient || !patient.patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Verificar que el tipo de signo vital existe
      const vitalSignType = await this.prisma.cat_vital_signs.findUnique({
        where: { id: vitalSignTypeId },
        include: {
          cat_measure_unit: true,
        },
      });

      if (!vitalSignType) {
        throw new NotFoundException('Tipo de signo vital no encontrado');
      }

      // Calcular fechas del mes
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

      // Obtener todos los registros del mes para este tipo de signo vital
      // NOTA: No filtramos por tenant_id intencionalmente
      // Los signos vitales propios del paciente (self-evaluation) no tienen tenant_id
      // y deben ser incluidos junto con los de consultas médicas
      const monthlyRecords = await this.prisma.vital_signs.findMany({
        where: {
          patient_id: patientId,
          vital_sign_id: vitalSignTypeId,
          deleted: false,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      // Calcular estadísticas mensuales
      const monthlyStats = this.calculateMonthlyStats(
        monthlyRecords,
        vitalSignType,
      );

      // Organizar datos por semanas
      const weeklyData = this.organizeWeeklyData(
        monthlyRecords,
        year,
        monthNum - 1,
      );

      // Preparar información del catálogo
      const vitalSignCatalogInfo = {
        id: vitalSignType.id,
        name: vitalSignType.name,
        category: vitalSignType.category,
        color: vitalSignType.color,
        mini_icon: vitalSignType.mini_icon,
        icon: vitalSignType.icon,
        background_icon: vitalSignType.background_icon,
        normal_min_value: vitalSignType.normal_min_value,
        normal_max_value: vitalSignType.normal_max_value,
        slightly_high_value: vitalSignType.slightly_high_value,
        high_max_value: vitalSignType.high_max_value,
        critical_max_value: vitalSignType.critical_max_value,
      };

      return {
        vital_sign: vitalSignCatalogInfo,
        cat_measure_unit: vitalSignType.cat_measure_unit
          ? {
              id: vitalSignType.cat_measure_unit.id,
              name: vitalSignType.cat_measure_unit.name,
              description: vitalSignType.cat_measure_unit.description,
            }
          : undefined,
        month,
        monthly_stats: monthlyStats,
        weekly_data: weeklyData,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener el historial del signo vital: ${error.message}`,
      );
    }
  }

  /**
   * Calcula las estadísticas mensuales de los registros
   */
  private calculateMonthlyStats(
    records: any[],
    vitalSignType: any,
  ): MonthlyStatsDto {
    if (records.length === 0) {
      return {
        last_value: undefined,
        last_value_date: undefined,
        max_value: undefined,
        max_value_date: undefined,
        min_value: undefined,
        min_value_date: undefined,
        average_value: undefined,
        total_records: 0,
        alerts_count: 0,
      };
    }

    // Ordenar por fecha para obtener el último
    const sortedRecords = [...records].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const lastRecord = sortedRecords[0];
    const measures = records.map((r) => r.measure);

    // Calcular estadísticas básicas
    const maxValue = Math.max(...measures);
    const minValue = Math.min(...measures);
    const averageValue =
      measures.reduce((sum, val) => sum + val, 0) / measures.length;

    // Encontrar registros con valores máximo y mínimo
    const maxRecord = records.find((r) => r.measure === maxValue);
    const minRecord = records.find((r) => r.measure === minValue);

    // Contar alertas (valores que superan el umbral crítico)
    let alertsCount = 0;
    if (vitalSignType.critical_max_value !== null) {
      alertsCount = records.filter(
        (r) => r.measure > vitalSignType.critical_max_value,
      ).length;
    }

    return {
      last_value: lastRecord.measure,
      last_value_date: lastRecord.created_at,
      max_value: maxValue,
      max_value_date: maxRecord.created_at,
      min_value: minValue,
      min_value_date: minRecord.created_at,
      average_value: Math.round(averageValue * 100) / 100, // Redondear a 2 decimales
      total_records: records.length,
      alerts_count: alertsCount,
    };
  }

  /**
   * Organiza los datos por semanas (domingo a sábado)
   */
  private organizeWeeklyData(
    records: any[],
    year: number,
    month: number,
  ): WeekDataDto[] {
    const weeks: WeekDataDto[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Agrupar registros por día
    const recordsByDay = new Map<number, any[]>();
    records.forEach((record) => {
      const day = new Date(record.created_at).getDate();
      if (!recordsByDay.has(day)) {
        recordsByDay.set(day, []);
      }
      recordsByDay.get(day)!.push(record);
    });

    // Encontrar el primer domingo del mes o anterior
    let currentDate: Date = new Date(firstDay);
    while (currentDate.getDay() !== 0) {
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Restar un día
    }

    let weekNumber = 1;

    while (currentDate <= lastDay || currentDate.getMonth() === month) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const days: DayDataDto[] = [];

      // Generar datos para cada día de la semana (domingo a sábado)
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const day = dayDate.getDate();

        // Solo incluir días que pertenecen al mes solicitado
        if (dayDate.getMonth() === month) {
          const dayRecords = recordsByDay.get(day) || [];

          let averageMeasure: number | 'Sin datos' = 'Sin datos';
          if (dayRecords.length > 0) {
            const sum = dayRecords.reduce(
              (acc, record) => acc + record.measure,
              0,
            );
            averageMeasure = Math.round((sum / dayRecords.length) * 100) / 100;
          }

          days.push({
            day,
            average_measure: averageMeasure,
            records_count: dayRecords.length,
          });
        }
      }

      // Solo agregar la semana si tiene días del mes solicitado
      if (days.length > 0) {
        weeks.push({
          week_number: weekNumber,
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          days,
        });
        weekNumber++;
      }

      // Avanzar a la siguiente semana
      currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Avanzar 7 días

      // Salir si ya pasamos el mes y no hay más días del mes en la semana actual
      if (currentDate.getMonth() > month) {
        break;
      }
    }

    return weeks;
  }
}
