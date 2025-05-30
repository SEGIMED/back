import { Injectable } from '@nestjs/common';
import { addHours, format, startOfDay } from 'date-fns';
import { FrequencyParseResult, DoseSchedule } from './frequency-parsing.types';

@Injectable()
export class FrequencyParsingService {
  /**
   * Parsea una frecuencia de medicación y devuelve información estructurada
   */
  parseFrequency(frequency: string): FrequencyParseResult {
    const normalizedFreq = frequency.toLowerCase().trim();

    switch (normalizedFreq) {
      case 'daily':
      case 'once_daily':
      case 'una_vez_al_dia':
        return {
          timesPerDay: 1,
          intervalHours: 24,
          suggestedTimes: ['08:00'],
          description: 'Una vez al día',
        };

      case 'twice_daily':
      case 'bid':
      case 'dos_veces_al_dia':
        return {
          timesPerDay: 2,
          intervalHours: 12,
          suggestedTimes: ['08:00', '20:00'],
          description: 'Dos veces al día',
        };

      case 'three_times_daily':
      case 'tid':
      case 'tres_veces_al_dia':
        return {
          timesPerDay: 3,
          intervalHours: 8,
          suggestedTimes: ['08:00', '16:00', '24:00'],
          description: 'Tres veces al día',
        };

      case 'four_times_daily':
      case 'qid':
      case 'cuatro_veces_al_dia':
        return {
          timesPerDay: 4,
          intervalHours: 6,
          suggestedTimes: ['06:00', '12:00', '18:00', '24:00'],
          description: 'Cuatro veces al día',
        };

      case 'every_4_hours':
      case 'cada_4_horas':
        return {
          timesPerDay: 6,
          intervalHours: 4,
          suggestedTimes: [
            '06:00',
            '10:00',
            '14:00',
            '18:00',
            '22:00',
            '02:00',
          ],
          description: 'Cada 4 horas',
        };

      case 'every_6_hours':
      case 'cada_6_horas':
        return {
          timesPerDay: 4,
          intervalHours: 6,
          suggestedTimes: ['06:00', '12:00', '18:00', '24:00'],
          description: 'Cada 6 horas',
        };

      case 'every_8_hours':
      case 'cada_8_horas':
        return {
          timesPerDay: 3,
          intervalHours: 8,
          suggestedTimes: ['08:00', '16:00', '24:00'],
          description: 'Cada 8 horas',
        };

      case 'every_12_hours':
      case 'cada_12_horas':
        return {
          timesPerDay: 2,
          intervalHours: 12,
          suggestedTimes: ['08:00', '20:00'],
          description: 'Cada 12 horas',
        };

      case 'weekly':
      case 'once_weekly':
      case 'una_vez_por_semana':
        return {
          timesPerDay: 1 / 7,
          intervalHours: 168, // 7 days * 24 hours
          suggestedTimes: ['08:00'],
          description: 'Una vez por semana',
        };

      case 'as_needed':
      case 'prn':
      case 'segun_necesidad':
        return {
          timesPerDay: 0,
          intervalHours: 0,
          suggestedTimes: [],
          description: 'Según necesidad',
        };

      default:
        // Intentar parsear formatos personalizados como "every_X_hours"
        const everyHoursMatch = normalizedFreq.match(/every_(\d+)_hours?/);
        if (everyHoursMatch) {
          const hours = parseInt(everyHoursMatch[1]);
          const timesPerDay = Math.floor(24 / hours);
          return {
            timesPerDay,
            intervalHours: hours,
            suggestedTimes: this.generateTimeSlots(timesPerDay, hours),
            description: `Cada ${hours} horas`,
          };
        }

        // Formato por defecto si no se reconoce
        return {
          timesPerDay: 1,
          intervalHours: 24,
          suggestedTimes: ['08:00'],
          description: 'Una vez al día (por defecto)',
        };
    }
  }

  /**
   * Genera horarios sugeridos basados en la frecuencia
   */
  private generateTimeSlots(
    timesPerDay: number,
    intervalHours: number,
  ): string[] {
    const times: string[] = [];
    const startHour = 8; // Comenzar a las 8:00 AM

    for (let i = 0; i < timesPerDay; i++) {
      const hour = (startHour + i * intervalHours) % 24;
      times.push(format(new Date(2024, 0, 1, hour, 0), 'HH:mm'));
    }

    return times;
  }

  /**
   * Calcula los horarios de dosis para un día específico basado en frecuencia y preferencias
   */
  calculateDoseTimesForDate(
    frequency: string,
    preferredTimes: string[] = [],
    targetDate: Date = new Date(),
  ): DoseSchedule[] {
    const frequencyData = this.parseFrequency(frequency);

    // Si es "según necesidad", no hay horarios fijos
    if (frequencyData.timesPerDay === 0) {
      return [];
    }

    let timesToUse: string[];

    // Usar horarios preferidos si se proporcionan y coinciden con la frecuencia
    if (
      preferredTimes.length > 0 &&
      preferredTimes.length >= frequencyData.timesPerDay
    ) {
      timesToUse = preferredTimes.slice(0, frequencyData.timesPerDay);
    } else {
      timesToUse = frequencyData.suggestedTimes;
    }

    const doses: DoseSchedule[] = [];
    const today = startOfDay(new Date());
    const targetDayStart = startOfDay(targetDate);
    const isToday = targetDayStart.getTime() === today.getTime();

    for (const timeSlot of timesToUse) {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const doseTime = new Date(targetDate);
      doseTime.setHours(hours, minutes, 0, 0);

      const isPast = isToday && doseTime < new Date();

      doses.push({
        time: timeSlot,
        timestamp: doseTime,
        isToday,
        isPast,
        status: 'pending', // Se debe actualizar con datos reales de la base de datos
      });
    }

    return doses.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Encuentra la próxima dosis para una medicación
   */
  getNextDose(
    frequency: string,
    preferredTimes: string[] = [],
  ): DoseSchedule | null {
    const now = new Date();
    const today = startOfDay(now);

    // Obtener dosis de hoy
    const todayDoses = this.calculateDoseTimesForDate(
      frequency,
      preferredTimes,
      today,
    );

    // Buscar la próxima dosis de hoy que no haya pasado
    const nextTodayDose = todayDoses.find(
      (dose) => dose.timestamp > now && dose.status === 'pending',
    );

    if (nextTodayDose) {
      return nextTodayDose;
    }

    // Si no hay más dosis hoy, calcular la primera dosis de mañana
    const tomorrow = addHours(today, 24);
    const tomorrowDoses = this.calculateDoseTimesForDate(
      frequency,
      preferredTimes,
      tomorrow,
    );

    return tomorrowDoses.length > 0 ? tomorrowDoses[0] : null;
  }

  /**
   * Calcula estadísticas de adherencia para un período
   */
  calculateAdherenceStats(doses: DoseSchedule[]): {
    total: number;
    taken: number;
    missed: number;
    pending: number;
    adherencePercentage: number;
  } {
    const total = doses.length;
    const taken = doses.filter((d) => d.status === 'taken').length;
    const missed = doses.filter((d) => d.status === 'missed').length;
    const pending = doses.filter((d) => d.status === 'pending').length;

    const adherencePercentage =
      total > 0 ? Math.round((taken / total) * 100) : 0;

    return {
      total,
      taken,
      missed,
      pending,
      adherencePercentage,
    };
  }

  /**
   * Valida formato de horario HH:MM
   */
  validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Valida que los horarios preferidos sean compatibles con la frecuencia
   */
  validatePreferredTimes(
    frequency: string,
    preferredTimes: string[],
  ): {
    isValid: boolean;
    message: string;
    suggestedTimes?: string[];
  } {
    const frequencyData = this.parseFrequency(frequency);

    // Validar formato de cada horario
    for (const time of preferredTimes) {
      if (!this.validateTimeFormat(time)) {
        return {
          isValid: false,
          message: `Formato de horario inválido: ${time}. Use formato HH:MM`,
        };
      }
    }

    // Para "según necesidad", no hay restricciones
    if (frequencyData.timesPerDay === 0) {
      return {
        isValid: true,
        message: 'Horarios válidos para medicación según necesidad',
      };
    }

    // Verificar que hay suficientes horarios
    if (preferredTimes.length < frequencyData.timesPerDay) {
      return {
        isValid: false,
        message: `Se requieren al menos ${frequencyData.timesPerDay} horarios para la frecuencia "${frequency}"`,
        suggestedTimes: frequencyData.suggestedTimes,
      };
    }

    // Verificar intervalo mínimo entre dosis
    if (preferredTimes.length > 1) {
      const sortedTimes = [...preferredTimes].sort();
      const minInterval = frequencyData.intervalHours;

      for (let i = 1; i < sortedTimes.length; i++) {
        const prevTime = this.timeStringToMinutes(sortedTimes[i - 1]);
        const currTime = this.timeStringToMinutes(sortedTimes[i]);
        const diffMinutes = currTime - prevTime;
        const diffHours = diffMinutes / 60;

        if (diffHours < minInterval) {
          return {
            isValid: false,
            message: `Intervalo mínimo requerido: ${minInterval} horas entre dosis`,
            suggestedTimes: frequencyData.suggestedTimes,
          };
        }
      }
    }

    return {
      isValid: true,
      message: 'Horarios válidos',
    };
  }

  /**
   * Convierte un string de tiempo HH:MM a minutos desde medianoche
   */
  private timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
