// Tipos y interfaces para el servicio de parsing de frecuencias

export interface FrequencyParseResult {
  timesPerDay: number;
  intervalHours: number;
  suggestedTimes: string[];
  description: string;
}

export interface DoseSchedule {
  time: string; // HH:mm format
  timestamp: Date;
  isToday: boolean;
  isPast: boolean;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  dose_log_id?: string; // ID del log si existe
}

export interface MedicationSchedule {
  prescription_id: string;
  monodrug: string;
  frequency: string;
  doses_today: DoseSchedule[];
  next_dose?: DoseSchedule;
  total_doses_today: number;
  taken_doses_today: number;
  missed_doses_today: number;
  adherence_percentage: number;
}

export interface AdherenceStats {
  total: number;
  taken: number;
  missed: number;
  pending: number;
  skipped: number;
  adherencePercentage: number;
}

export interface TimeValidationResult {
  isValid: boolean;
  message: string;
  suggestedTimes?: string[];
}

// Enum para frecuencias soportadas
export enum SupportedFrequency {
  DAILY = 'daily',
  TWICE_DAILY = 'twice_daily',
  THREE_TIMES_DAILY = 'three_times_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  EVERY_4_HOURS = 'every_4_hours',
  EVERY_6_HOURS = 'every_6_hours',
  EVERY_8_HOURS = 'every_8_hours',
  EVERY_12_HOURS = 'every_12_hours',
  WEEKLY = 'weekly',
  AS_NEEDED = 'as_needed',
}

// Mapeo de frecuencias en español
export const FrequencySpanishMap: Record<string, SupportedFrequency> = {
  una_vez_al_dia: SupportedFrequency.DAILY,
  dos_veces_al_dia: SupportedFrequency.TWICE_DAILY,
  tres_veces_al_dia: SupportedFrequency.THREE_TIMES_DAILY,
  cuatro_veces_al_dia: SupportedFrequency.FOUR_TIMES_DAILY,
  cada_4_horas: SupportedFrequency.EVERY_4_HOURS,
  cada_6_horas: SupportedFrequency.EVERY_6_HOURS,
  cada_8_horas: SupportedFrequency.EVERY_8_HOURS,
  cada_12_horas: SupportedFrequency.EVERY_12_HOURS,
  una_vez_por_semana: SupportedFrequency.WEEKLY,
  segun_necesidad: SupportedFrequency.AS_NEEDED,
};

// Configuración por defecto para cada frecuencia
export const FrequencyDefaults: Record<
  SupportedFrequency,
  FrequencyParseResult
> = {
  [SupportedFrequency.DAILY]: {
    timesPerDay: 1,
    intervalHours: 24,
    suggestedTimes: ['08:00'],
    description: 'Una vez al día',
  },
  [SupportedFrequency.TWICE_DAILY]: {
    timesPerDay: 2,
    intervalHours: 12,
    suggestedTimes: ['08:00', '20:00'],
    description: 'Dos veces al día',
  },
  [SupportedFrequency.THREE_TIMES_DAILY]: {
    timesPerDay: 3,
    intervalHours: 8,
    suggestedTimes: ['08:00', '16:00', '24:00'],
    description: 'Tres veces al día',
  },
  [SupportedFrequency.FOUR_TIMES_DAILY]: {
    timesPerDay: 4,
    intervalHours: 6,
    suggestedTimes: ['06:00', '12:00', '18:00', '24:00'],
    description: 'Cuatro veces al día',
  },
  [SupportedFrequency.EVERY_4_HOURS]: {
    timesPerDay: 6,
    intervalHours: 4,
    suggestedTimes: ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'],
    description: 'Cada 4 horas',
  },
  [SupportedFrequency.EVERY_6_HOURS]: {
    timesPerDay: 4,
    intervalHours: 6,
    suggestedTimes: ['06:00', '12:00', '18:00', '24:00'],
    description: 'Cada 6 horas',
  },
  [SupportedFrequency.EVERY_8_HOURS]: {
    timesPerDay: 3,
    intervalHours: 8,
    suggestedTimes: ['08:00', '16:00', '24:00'],
    description: 'Cada 8 horas',
  },
  [SupportedFrequency.EVERY_12_HOURS]: {
    timesPerDay: 2,
    intervalHours: 12,
    suggestedTimes: ['08:00', '20:00'],
    description: 'Cada 12 horas',
  },
  [SupportedFrequency.WEEKLY]: {
    timesPerDay: 1 / 7,
    intervalHours: 168,
    suggestedTimes: ['08:00'],
    description: 'Una vez por semana',
  },
  [SupportedFrequency.AS_NEEDED]: {
    timesPerDay: 0,
    intervalHours: 0,
    suggestedTimes: [],
    description: 'Según necesidad',
  },
};
