# Medication Scheduler Service - Documentación

## Descripción

El Medication Scheduler Service es un servicio automatizado que se ejecuta en segundo plano para procesar recordatorios de medicación, gestionar dosis programadas y enviar notificaciones a pacientes. Utiliza trabajos cron para ejecutar tareas de manera regular y automática.

## Funcionalidades Principales

- **Procesamiento automático de recordatorios**: Ejecuta cada 5 minutos
- **Gestión de dosis programadas**: Rastrea las tomas de medicamentos
- **Notificaciones multi-canal**: Email, WhatsApp y push notifications
- **Registro de logs de medicación**: Historial completo de tomas
- **Manejo de prescripciones activas**: Solo procesa medicamentos vigentes

## Configuración del Cron Job

### Frecuencia de Ejecución

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async processScheduledReminders(): Promise<void>
```

**Ejecuta cada 5 minutos** para asegurar que los recordatorios se envíen puntualmente.

### Expresiones Cron Disponibles

```typescript
// Opciones de configuración
EVERY_5_MINUTES = '*/5 * * * *';
EVERY_10_MINUTES = '*/10 * * * *';
EVERY_HOUR = '0 * * * *';
EVERY_DAY_AT_8AM = '0 8 * * *';
```

## Métodos Principales

### 1. `processScheduledReminders()`

Método principal que se ejecuta automáticamente cada 5 minutos.

#### Flujo de Procesamiento

1. Obtiene todas las prescripciones activas
2. Para cada prescripción, verifica si es momento de enviar recordatorio
3. Calcula la próxima dosis basada en la frecuencia
4. Envía notificaciones según las preferencias del paciente
5. Registra el log de recordatorio enviado

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async processScheduledReminders(): Promise<void> {
  this.logger.log('Iniciando procesamiento de recordatorios de medicación...');

  try {
    const activePrescriptions = await this.getActivePrescriptions();
    this.logger.log(`Encontradas ${activePrescriptions.length} prescripciones activas`);

    for (const prescription of activePrescriptions) {
      await this.processPrescriptionReminder(prescription);
    }

    this.logger.log('Procesamiento completado exitosamente');
  } catch (error) {
    this.logger.error(`Error en procesamiento: ${error.message}`);
  }
}
```

### 2. `getActivePrescriptions()`

Obtiene todas las prescripciones activas que requieren recordatorios.

#### Criterios de Selección

- Estado de prescripción: `active`
- Fecha de inicio <= fecha actual
- Fecha de fin >= fecha actual (si está definida)
- Recordatorios habilitados en configuración del paciente

```typescript
private async getActivePrescriptions() {
  return await this.prisma.prescription.findMany({
    where: {
      status: 'active',
      start_date: {
        lte: new Date()
      },
      OR: [
        { end_date: null },
        { end_date: { gte: new Date() } }
      ],
      patient: {
        reminder_settings: {
          reminder_enabled: true
        }
      }
    },
    include: {
      patient: {
        include: {
          reminder_settings: true
        }
      },
      medication: true,
      dose_logs: {
        orderBy: { scheduled_time: 'desc' },
        take: 1
      }
    }
  });
}
```

### 3. `processPrescriptionReminder(prescription)`

Procesa recordatorios para una prescripción específica.

#### Parámetros

- `prescription`: Objeto de prescripción con paciente y medicamento incluidos

#### Lógica de Procesamiento

```typescript
private async processPrescriptionReminder(prescription: any) {
  const now = new Date();
  const nextDoseTime = this.calculateNextDoseTime(prescription);

  // Verificar si es momento de enviar recordatorio
  const reminderTime = new Date(nextDoseTime.getTime() - (prescription.patient.reminder_settings.reminder_before_minutes * 60000));

  if (now >= reminderTime && now < nextDoseTime) {
    const alreadySent = await this.checkIfReminderAlreadySent(prescription.id, nextDoseTime);

    if (!alreadySent) {
      await this.sendMedicationReminder(prescription);
      await this.logReminderSent(prescription.id, nextDoseTime);
    }
  }
}
```

### 4. `calculateNextDoseTime(prescription)`

Calcula el próximo horario de toma basado en la frecuencia de la prescripción.

#### Tipos de Frecuencia Soportados

| Frecuencia          | Descripción             | Ejemplo                    |
| ------------------- | ----------------------- | -------------------------- |
| `daily`             | Una vez al día          | 08:00 diariamente          |
| `twice_daily`       | Dos veces al día        | 08:00 y 20:00              |
| `three_times_daily` | Tres veces al día       | 08:00, 14:00, 20:00        |
| `four_times_daily`  | Cuatro veces al día     | 08:00, 12:00, 16:00, 20:00 |
| `every_x_hours`     | Cada X horas            | Cada 6, 8, 12 horas        |
| `custom`            | Horarios personalizados | Horarios específicos       |

```typescript
private calculateNextDoseTime(prescription: any): Date {
  const now = new Date();
  const frequency = prescription.frequency;
  const customTimes = prescription.custom_dose_times; // ["08:00", "14:00", "20:00"]

  switch (frequency) {
    case 'daily':
      return this.getNextDailyDose(now, ['08:00']);

    case 'twice_daily':
      return this.getNextDailyDose(now, ['08:00', '20:00']);

    case 'three_times_daily':
      return this.getNextDailyDose(now, ['08:00', '14:00', '20:00']);

    case 'custom':
      return this.getNextDailyDose(now, customTimes);

    case 'every_x_hours':
      return this.getNextHourlyDose(now, prescription.hour_interval);

    default:
      throw new Error(`Frecuencia no soportada: ${frequency}`);
  }
}
```

### 5. `sendMedicationReminder(prescription)`

Envía recordatorios de medicación utilizando los canales habilitados.

#### Canales de Notificación

```typescript
private async sendMedicationReminder(prescription: any) {
  const patient = prescription.patient;
  const medication = prescription.medication;
  const settings = patient.reminder_settings;

  const reminderMessage = this.buildReminderMessage(prescription);

  const promises = [];

  // WhatsApp
  if (settings.whatsapp_enabled && patient.phone) {
    promises.push(
      this.notificationService.sendWhatsAppReminder(
        patient.phone,
        reminderMessage
      )
    );
  }

  // Email
  if (settings.email_enabled && patient.email) {
    promises.push(
      this.notificationService.sendEmailReminder(
        patient.email,
        patient.name,
        prescription
      )
    );
  }

  // Push Notifications
  if (settings.push_notifications_enabled) {
    promises.push(
      this.notificationService.sendPushNotification(
        patient.id,
        'Recordatorio de Medicación',
        reminderMessage
      )
    );
  }

  await Promise.allSettled(promises);

  this.logger.log(`Recordatorio enviado para prescripción ${prescription.id}`);
}
```

### 6. `buildReminderMessage(prescription)`

Construye el mensaje de recordatorio personalizado.

```typescript
private buildReminderMessage(prescription: any): string {
  const medication = prescription.medication;
  const dosage = prescription.dosage;
  const nextDoseTime = this.calculateNextDoseTime(prescription);

  return `🏥 RECORDATORIO SEGIMED

Medicamento: ${medication.commercial_name || medication.name}
Dosis: ${dosage}
Horario: ${this.formatTime(nextDoseTime)}

Es importante tomar su medicamento en el horario indicado para mantener la efectividad del tratamiento.

Si ya tomó su medicamento, puede ignorar este mensaje.`;
}
```

## Logging y Registro

### Tabla de Logs de Medicación

```typescript
// Estructura de medication_dose_log
{
  id: string;
  prescription_id: string;
  scheduled_time: Date;
  actual_time?: Date;
  status: 'scheduled' | 'taken' | 'missed' | 'skipped';
  reminder_sent: boolean;
  reminder_sent_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Registro de Recordatorios Enviados

```typescript
private async logReminderSent(prescriptionId: string, scheduledTime: Date) {
  await this.prisma.medicationDoseLog.create({
    data: {
      prescription_id: prescriptionId,
      scheduled_time: scheduledTime,
      status: 'scheduled',
      reminder_sent: true,
      reminder_sent_at: new Date()
    }
  });
}
```

### Verificación de Recordatorios Duplicados

```typescript
private async checkIfReminderAlreadySent(
  prescriptionId: string,
  scheduledTime: Date
): Promise<boolean> {
  const existing = await this.prisma.medicationDoseLog.findFirst({
    where: {
      prescription_id: prescriptionId,
      scheduled_time: scheduledTime,
      reminder_sent: true
    }
  });

  return !!existing;
}
```

## Manejo de Casos Especiales

### 1. Medicamentos con Comidas

```typescript
// Recordatorios específicos para medicamentos con comidas
private buildMealBasedReminder(prescription: any): string {
  const mealTiming = prescription.meal_timing; // 'before', 'after', 'with'

  const mealInstructions = {
    'before': 'Tomar 30 minutos antes de la comida',
    'after': 'Tomar 30 minutos después de la comida',
    'with': 'Tomar durante la comida'
  };

  return `${this.buildReminderMessage(prescription)}

⚠️ Instrucción especial: ${mealInstructions[mealTiming]}`;
}
```

### 2. Medicamentos con Dosis Decrecientes

```typescript
// Manejo de prescripciones con dosis que cambian en el tiempo
private calculateDecreasingDose(prescription: any, currentDate: Date): string {
  const startDate = prescription.start_date;
  const daysSinceStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

  if (prescription.dose_schedule) {
    const schedule = JSON.parse(prescription.dose_schedule);
    return schedule[daysSinceStart] || schedule[schedule.length - 1];
  }

  return prescription.dosage;
}
```

### 3. Medicamentos PRN (Pro Re Nata - Según Necesidad)

```typescript
// No enviar recordatorios automáticos para medicamentos PRN
private shouldSendReminder(prescription: any): boolean {
  if (prescription.frequency === 'prn') {
    return false; // Medicamentos según necesidad no requieren recordatorios automáticos
  }

  return prescription.patient.reminder_settings.reminder_enabled;
}
```

## Integración con Otros Servicios

### Con Notification Service

```typescript
// Inyección del servicio de notificaciones
constructor(
  private readonly prisma: PrismaService,
  private readonly notificationService: NotificationService,
) {}
```

### Con Patient Settings

```typescript
// Obtener configuraciones específicas del paciente
private async getPatientReminderSettings(patientId: string) {
  return await this.prisma.patientReminderSettings.findUnique({
    where: { patient_id: patientId }
  });
}
```

## Monitoreo y Métricas

### Logs de Sistema

```typescript
// Logging detallado para monitoreo
this.logger.log('Iniciando procesamiento de recordatorios...');
this.logger.log(`Procesando ${activePrescriptions.length} prescripciones`);
this.logger.log(`Recordatorio enviado para prescripción ${prescriptionId}`);
this.logger.error(`Error enviando recordatorio: ${error.message}`);
this.logger.warn(
  `Configuración de recordatorio no encontrada para paciente ${patientId}`,
);
```

### Métricas de Rendimiento

```typescript
// Métricas importantes a monitorear
const metrics = {
  total_prescriptions_processed: activePrescriptions.length,
  reminders_sent: remindersSentCount,
  errors_encountered: errorsCount,
  processing_time_ms: processingTime,
  patients_reached: uniquePatientsCount,
};

this.logger.log(`Métricas de procesamiento: ${JSON.stringify(metrics)}`);
```

### Dashboard de Salud

```typescript
// Health check endpoint para monitoreo
@Get('health')
async getHealthStatus() {
  const lastRun = await this.getLastSuccessfulRun();
  const isHealthy = (Date.now() - lastRun.getTime()) < 10 * 60 * 1000; // 10 minutos

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    last_successful_run: lastRun,
    active_prescriptions_count: await this.getActivePrescriptionsCount()
  };
}
```

## Mejores Prácticas

### 1. Manejo de Errores Graceful

```typescript
// No fallar todo el procesamiento por un error individual
for (const prescription of activePrescriptions) {
  try {
    await this.processPrescriptionReminder(prescription);
  } catch (error) {
    this.logger.error(
      `Error procesando prescripción ${prescription.id}: ${error.message}`,
    );
    // Continúa con la siguiente prescripción
  }
}
```

### 2. Optimización de Consultas

```typescript
// Usar includes para reducir consultas a la base de datos
const activePrescriptions = await this.prisma.prescription.findMany({
  include: {
    patient: {
      include: { reminder_settings: true },
    },
    medication: true,
    dose_logs: {
      where: {
        scheduled_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
  },
});
```

### 3. Rate Limiting para Notificaciones

```typescript
// Evitar spam de notificaciones
private async canSendReminder(patientId: string): Promise<boolean> {
  const recentReminders = await this.prisma.medicationDoseLog.count({
    where: {
      prescription: { patient_id: patientId },
      reminder_sent_at: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Última hora
      }
    }
  });

  return recentReminders < 5; // Máximo 5 recordatorios por hora por paciente
}
```

## Seguridad y Privacidad

### Protección de Datos

- Logs no contienen información sensible del paciente
- Encriptación de comunicaciones con servicios externos
- Auditoria de accesos a datos de medicación

### Cumplimiento Regulatorio

- Seguimiento de normativas farmacéuticas
- Registro de audit trail para prescripciones
- Consentimiento explícito para recordatorios

### Backup y Recuperación

- Backup automático de logs de medicación
- Recuperación de recordatorios perdidos
- Sincronización con sistemas externos
