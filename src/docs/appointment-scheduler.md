# Appointment Scheduler Service

## Descripción

El `AppointmentSchedulerService` es un servicio automatizado que se ejecuta como un cron job para marcar automáticamente las citas médicas pendientes como "no_asistida" cuando han pasado su hora de finalización.

## Funcionalidades

### 1. Procesamiento Automático

- **Cron Job**: Se ejecuta cada hora (`@Cron(CronExpression.EVERY_HOUR)`)
- **Función**: Revisa todas las citas con estado "pendiente" cuya fecha/hora de fin ya ha pasado
- **Acción**: Las marca automáticamente como "no_asistida"

### 2. Procesamiento Manual

- **Endpoint**: `POST /appointment-scheduler/process-expired`
- **Uso**: Permite ejecutar manualmente el proceso de marcado de citas expiradas
- **Respuesta**: Retorna el número de citas procesadas y la lista de citas afectadas

### 3. Estadísticas

- **Endpoint**: `GET /appointment-scheduler/statistics`
- **Parámetros opcionales**:
  - `startDate`: Fecha de inicio para filtrar
  - `endDate`: Fecha de fin para filtrar
  - `tenantId`: ID del tenant para filtrar
- **Respuesta**: Conteo de citas por estado (pendiente, atendida, cancelada, no_asistida)

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
@Cron(CronExpression.EVERY_HOUR)
async processExpiredAppointments(): Promise<void>
```

Para cambiar la frecuencia, modifica la expresión cron:

- `CronExpression.EVERY_5_MINUTES` - Cada 5 minutos
- `CronExpression.EVERY_30_MINUTES` - Cada 30 minutos
- `CronExpression.EVERY_HOUR` - Cada hora (actual)
- `CronExpression.EVERY_6_HOURS` - Cada 6 horas

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
