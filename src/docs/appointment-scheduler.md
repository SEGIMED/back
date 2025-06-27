# Appointment Scheduler Service - API Endpoints

## Descripción

El Appointment Scheduler Service proporciona funcionalidades para la gestión automatizada de citas médicas, incluyendo el procesamiento de citas expiradas, verificación del estado del sistema y mantenimiento automático de la agenda médica.

## Base URL

`/appointment-scheduler`

## Requerimientos de Headers

- `Authorization`: Bearer token JWT para autenticación
- Se utiliza el tenant extraído automáticamente del JWT

## Permisos Requeridos

- `MANAGE_APPOINTMENTS`: Para ejecutar procesos de programación
- `VIEW_SYSTEM_STATUS`: Para consultar el estado del sistema

## Endpoints

### Procesar Citas Expiradas Manualmente

**Endpoint:** `POST /appointment-scheduler/process-expired`

**Descripción:** Ejecuta manualmente el proceso de marcado de citas pendientes como "no_asistida" cuando han pasado más de 30 minutos de la hora programada.

#### Request

No requiere body de request.

#### Response

```json
{
  "message": "Proceso de citas expiradas ejecutado exitosamente",
  "processed_appointments": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "patient_name": "Juan Pérez",
      "physician_name": "Dr. María García",
      "scheduled_time": "2025-06-27T10:30:00.000Z",
      "previous_status": "pending",
      "new_status": "no_asistida",
      "reason": "Cita expirada - sin asistencia después de 30 minutos"
    }
  ],
  "total_processed": 5,
  "execution_time": "2025-06-27T11:05:00.000Z"
}
```

#### Status Codes

- `200 OK`: Proceso ejecutado exitosamente
- `401 Unauthorized`: Token de autenticación inválido
- `403 Forbidden`: Sin permisos para ejecutar este proceso
- `500 Internal Server Error`: Error interno del servidor

### Consultar Estado del Sistema

**Endpoint:** `GET /appointment-scheduler/status`

**Descripción:** Obtiene información sobre el estado actual del sistema de programación de citas.

#### Query Parameters

- `include_stats` (boolean, opcional): Incluir estadísticas detalladas
- `date_range` (string, opcional): Rango de fechas para estadísticas ("today", "week", "month")

#### Response

```json
{
  "system_status": "healthy",
  "last_execution": {
    "process_expired": "2025-06-27T11:00:00.000Z",
    "reminder_notifications": "2025-06-27T10:55:00.000Z"
  },
  "statistics": {
    "total_appointments_today": 25,
    "pending_appointments": 8,
    "completed_appointments": 12,
    "no_asistida_appointments": 3,
    "cancelled_appointments": 2,
    "upcoming_in_next_hour": 4
  },
  "system_health": {
    "database_connection": "healthy",
    "notification_service": "healthy",
    "email_service": "healthy",
    "last_health_check": "2025-06-27T11:05:00.000Z"
  }
}
```

## Funcionalidades Automáticas

### 1. Proceso de Citas Expiradas

#### Configuración Automática

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async processExpiredAppointments(): Promise<void>
```

#### Lógica de Procesamiento

1. **Identificación de Citas Expiradas:**

   - Busca citas con estado `pending`
   - Verifica que la hora programada + 30 minutos < hora actual
   - Filtra por tenant del contexto actual

2. **Actualización de Estado:**

   - Cambia estado de `pending` a `no_asistida`
   - Registra timestamp de actualización
   - Añade nota explicativa del cambio

3. **Notificaciones:**
   - Notifica al médico sobre la cita perdida
   - Registra en el historial del paciente
   - Actualiza métricas del sistema

#### Criterios de Expiración

```typescript
const expiredAppointments = await this.prisma.appointment.findMany({
  where: {
    status: 'pending',
    scheduled_date: {
      lt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    },
    tenant_id: currentTenantId,
  },
});
```

### 2. Recordatorios Automáticos

#### Notificaciones Previas

- **24 horas antes**: Email y SMS de confirmación
- **2 horas antes**: Recordatorio por WhatsApp
- **30 minutos antes**: Notificación push final

#### Configuración de Recordatorios

```typescript
@Cron(CronExpression.EVERY_HOUR)
async sendAppointmentReminders(): Promise<void> {
  await this.send24HourReminders();
  await this.send2HourReminders();
  await this.send30MinuteReminders();
}
```

## Archivos Implementados

### Core Service

- `src/services/appointment-scheduler/appointment-scheduler.service.ts`
- `src/services/appointment-scheduler/appointment-scheduler.module.ts`
- `src/services/appointment-scheduler/appointment-scheduler.controller.ts`

### Integración

- Módulo agregado al `app.module.ts`

## Configuración

### Frecuencia del Cron Job

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async processExpiredAppointments(): Promise<void>
```

Para cambiar la frecuencia, modifica la expresión cron:

- `CronExpression.EVERY_5_MINUTES` - Cada 5 minutos
- `CronExpression.EVERY_30_MINUTES` - Cada 30 minutos
- `CronExpression.EVERY_HOUR` - Cada hora
- `CronExpression.EVERY_DAY_AT_MIDNIGHT` - Diariamente a medianoche (actual)

## Logging

El servicio registra toda su actividad:

- Inicio de procesamiento
- Número de citas encontradas
- Número de citas procesadas
- Detalles de cada cita marcada como no_asistida (en modo debug)
- Errores si ocurren

## Seguridad

- El controlador está protegido con `TenantAccessGuard`
- Requiere autenticación Bearer token
- Solo usuarios autenticados pueden ejecutar procesamiento manual o ver estadísticas

## Testing

### Test Manual via API

```bash
# Procesar citas expiradas manualmente
curl -X POST http://localhost:3000/appointment-scheduler/process-expired \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener estadísticas
curl -X GET http://localhost:3000/appointment-scheduler/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Estadísticas con filtros
curl -X GET "http://localhost:3000/appointment-scheduler/statistics?startDate=2025-01-01&endDate=2025-12-31&tenantId=TENANT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Base de Datos

### Estados de Cita

El enum `status_type` incluye:

- `pendiente` - Cita programada, no realizada aún
- `atendida` - Cita completada exitosamente
- `cancelada` - Cita cancelada
- `no_asistida` - Cita perdida/no asistida (nuevo estado)

### Consulta de Citas Expiradas

```sql
SELECT * FROM appointment
WHERE status = 'pendiente'
  AND "end" < NOW()
  AND deleted = false;
```

## Monitoring

Para monitorear el servicio en producción:

1. Revisar logs del contenedor/aplicación
2. Usar el endpoint de estadísticas para verificar que se están procesando citas
3. Configurar alertas si el número de citas "no_asistida" aumenta significativamente

## Próximos Pasos (Fase 3)

1. **Testing unitario** del servicio
2. **Configuración de monitoreo** y alertas
3. **Métricas** de rendimiento
4. **Notificaciones** opcionales cuando se marcan citas como no_asistida
