# Sistema de Seguimiento de Medicación - DTOs e Interfaces

## Resumen

Este documento describe los DTOs (Data Transfer Objects) e interfaces implementadas para el sistema completo de seguimiento de medicación en el backend de Segimed.

## Estructura de Archivos

```
src/medical-scheduling/modules/prescription/dto/
├── create-prescription.dto.ts          # DTO principal actualizado con campos de tracking
├── update-prescription.dto.ts          # DTO de actualización (sin cambios)
├── medication-tracking.dto.ts          # DTOs para activar/configurar tracking
├── medication-dose.dto.ts              # DTOs para registro de dosis
├── medication-skip-reason.dto.ts       # DTOs para motivos de omisión
├── medication-tracking-response.dto.ts # DTOs de respuesta con información de tracking
└── index.ts                           # Archivo de exportación centralizada
```

## DTOs Principales

### 1. CreatePrescriptionDto (Actualizado)

**Archivo:** `create-prescription.dto.ts`

**Campos originales preservados:**

- `start_timestamp`: Fecha/hora de inicio de la prescripción
- `end_timestamp`: Fecha/hora de fin de la prescripción
- `description`: Descripción/instrucciones de la prescripción
- `active`: Estado activo de la prescripción
- `patient_id`: ID del paciente
- `monodrug`: Nombre del medicamento
- `tenant_id`: ID del tenant

**Nuevos campos para tracking:**

- `created_by_patient`: Boolean - Indica si fue creada por el paciente
- `is_tracking_active`: Boolean - Indica si el tracking está activo
- `reminder_enabled`: Boolean - Indica si los recordatorios están habilitados
- `first_dose_taken_at`: Date - Timestamp de la primera dosis tomada
- `time_of_day_slots`: string[] - Horarios preferidos para tomar medicación
- `last_reminder_sent_at`: Date - Timestamp del último recordatorio enviado
- `reminders_sent_count`: number - Contador de recordatorios enviados
- `skip_reason_id`: number - Referencia al catálogo de motivos de omisión
- `skip_reason_details`: string - Detalles adicionales sobre omisión

### 2. DTOs de Tracking de Medicación

**Archivo:** `medication-tracking.dto.ts`

#### ActivateMedicationTrackingDto

Usado para activar el seguimiento de una prescripción específica.

**Campos:**

- `prescription_id`: UUID de la prescripción
- `reminder_enabled`: Boolean opcional - Habilitar recordatorios
- `time_of_day_slots`: string[] opcional - Horarios preferidos
- `first_dose_taken_at`: Date opcional - Primera dosis tomada

#### UpdateMedicationTrackingDto

Usado para actualizar la configuración de tracking.

**Campos:**

- `is_tracking_active`: Boolean opcional
- `reminder_enabled`: Boolean opcional
- `time_of_day_slots`: string[] opcional
- `skip_reason_id`: number opcional
- `skip_reason_details`: string opcional

#### UpdatePatientReminderSettingsDto

Usado para configurar las preferencias globales de recordatorios del paciente.

**Campos:**

- `medication_reminder_interval_minutes`: number - Intervalo entre recordatorios (default: 30)
- `medication_reminder_max_retries`: number - Máximo de reintentos (default: 3)

### 3. DTOs de Registro de Dosis

**Archivo:** `medication-dose.dto.ts`

#### MedicationDoseStatus (Enum)

Estados posibles de una dosis:

- `TAKEN`: Dosis tomada
- `MISSED_AUTOMATIC`: Dosis perdida automáticamente
- `MISSED_REPORTED`: Dosis perdida reportada por usuario
- `SKIPPED_BY_USER`: Dosis omitida intencionalmente por usuario

#### RecordMedicationDoseDto

Usado para registrar cuando se toma/omite una dosis.

**Campos:**

- `prescription_id`: UUID de la prescripción
- `dose_status`: MedicationDoseStatus - Estado de la dosis
- `scheduled_time`: Date - Hora programada
- `taken_time`: Date opcional - Hora real de toma
- `skip_reason_id`: number opcional - Motivo de omisión
- `notes`: string opcional - Notas adicionales

#### MedicationDoseHistoryQueryDto

Usado para consultar el historial de dosis con filtros.

**Campos:**

- `prescription_id`: UUID opcional - Filtrar por prescripción
- `patient_id`: UUID opcional - Filtrar por paciente
- `start_date`: Date opcional - Fecha inicio
- `end_date`: Date opcional - Fecha fin
- `dose_status`: MedicationDoseStatus opcional - Filtrar por estado
- `limit`: number opcional - Registros por página (default: 50)
- `offset`: number opcional - Offset para paginación (default: 0)

#### MedicationDoseLogResponseDto

Estructura de respuesta para logs de dosis.

**Campos:**

- `id`: number - ID único del log
- `prescription_id`: string - ID de la prescripción
- `user_id`: string - ID del usuario que registró
- `dose_status`: MedicationDoseStatus - Estado de la dosis
- `scheduled_time`: Date - Hora programada
- `taken_time`: Date opcional - Hora real
- `skip_reason`: objeto opcional - Información del motivo de omisión
- `notes`: string opcional - Notas
- `created_at`: Date - Fecha de creación
- `updated_at`: Date - Fecha de actualización

### 4. DTOs de Motivos de Omisión (Catálogo con CRUD)

**Archivo:** `medication-skip-reason.dto.ts`

> **IMPORTANTE:** La tabla `medication_skip_reason_catalog` es un catálogo con CRUD completo. Los administradores pueden gestionar los motivos de omisión según las necesidades del sistema.

#### CreateMedicationSkipReasonDto

DTO para crear nuevos motivos de omisión.

**Campos:**

- `reason_text`: string - Descripción del motivo (requerido)
- `category`: string - Categoría del motivo (requerido)

#### UpdateMedicationSkipReasonDto

DTO para actualizar motivos de omisión existentes.

**Campos:**

- `reason_text`: string opcional - Nueva descripción del motivo
- `category`: string opcional - Nueva categoría del motivo

#### MedicationSkipReasonResponseDto

DTO de respuesta para motivos de omisión del catálogo.

**Campos:**

- `id`: number - Identificador único autoincrement
- `reason_text`: string - Descripción del motivo
- `category`: string - Categoría del motivo
- `created_at`: Date - Timestamp de creación
- `updated_at`: Date - Timestamp de última actualización

#### MedicationSkipReasonQueryDto

DTO para consultar motivos de omisión con filtros.

**Campos:**

- `category`: string opcional - Filtrar por categoría
- `limit`: number opcional - Registros por página (default: 50)
- `offset`: number opcional - Offset para paginación (default: 0)

#### MedicationSkipReasonCategoriesDto

DTO para obtener lista de categorías únicas disponibles.

**Campos:**

- `categories`: string[] - Array con las 7 categorías únicas del catálogo

#### MedicationSkipReasonResponseDto

Estructura de respuesta para motivos de omisión.

**Campos:**

- `id`: number - ID único
- `reason_text`: string - Descripción
- `category`: string - Categoría

#### MedicationSkipReasonQueryDto

Para consultar motivos con filtros.

**Campos:**

- `category`: string opcional - Filtrar por categoría
- `limit`: number opcional - Registros por página
- `offset`: number opcional - Offset para paginación

### 5. DTOs de Respuesta con Tracking

**Archivo:** `medication-tracking-response.dto.ts`

#### PrescriptionWithTrackingResponseDto

Respuesta completa de prescripción con información de tracking.

**Campos principales:**

- Todos los campos básicos de prescripción
- Campos de tracking (created_by_patient, is_tracking_active, etc.)
- Información de motivos de omisión relacionados
- Timestamps de creación y actualización

#### MedicationAdherenceStatsDto

Estadísticas de adherencia del paciente.

**Campos:**

- `patient_id`: string - ID del paciente
- `prescription_id`: string opcional - ID específico de prescripción
- `total_scheduled_doses`: number - Total de dosis programadas
- `doses_taken`: number - Dosis tomadas
- `doses_missed_automatic`: number - Dosis perdidas automáticamente
- `doses_missed_reported`: number - Dosis perdidas reportadas
- `doses_skipped_by_user`: number - Dosis omitidas por usuario
- `adherence_percentage`: number - Porcentaje de adherencia
- `period_start`: Date - Inicio del período
- `period_end`: Date - Fin del período
- `skip_reasons_breakdown`: object - Desglose por motivos de omisión

#### ActiveTrackingMedicationsDto

Resumen de medicaciones con tracking activo.

**Campos:**

- `patient_id`: string - ID del paciente
- `active_prescriptions`: PrescriptionWithTrackingResponseDto[] - Lista de prescripciones activas
- `next_scheduled_doses`: array - Próximas dosis programadas
- `reminder_settings`: object - Configuración de recordatorios del paciente
- `adherence_summary`: object - Resumen general de adherencia

## Interfaces Actualizadas

### MedicationItemInterface (Sin cambios)

Interfaz original preservada para compatibilidad:

```typescript
{
  monodrug: string;
  dose: string;
  dose_units: string;
  frecuency: string;
  duration: string;
  duration_units: string;
  observations?: string;
}
```

### MedicationItemWithTrackingInterface (Nueva)

Interfaz extendida para incluir campos de tracking:

```typescript
extends MedicationItemInterface {
  created_by_patient?: boolean;
  is_tracking_active?: boolean;
  reminder_enabled?: boolean;
  first_dose_taken_at?: Date;
  time_of_day_slots?: string[];
  skip_reason_id?: number;
  skip_reason_details?: string;
}
```

## Validaciones Implementadas

### Class Validators Utilizados

- `@IsBoolean()`: Para campos booleanos
- `@IsDate()`: Para fechas con `@Type(() => Date)`
- `@IsString()`: Para campos de texto
- `@IsNumber()`: Para campos numéricos
- `@IsArray()`: Para arrays con `@IsString({ each: true })`
- `@IsEnum()`: Para enums como MedicationDoseStatus
- `@IsUUID()`: Para identificadores UUID
- `@IsOptional()`: Para campos opcionales
- `@IsNotEmpty()`: Para campos requeridos

### Documentación Swagger

- Todos los DTOs incluyen documentación completa con `@ApiProperty()`
- Ejemplos de valores para cada campo
- Indicación de campos requeridos/opcionales
- Tipos de datos especificados
- Descripciones detalladas de funcionalidad

## Verificación de Consistencia

✅ **FASE 2 COMPLETA - DTOs vs Schema:**

- **Tabla `patient`** ↔ `UpdatePatientReminderSettingsDto`: ✅ Perfecta correspondencia
- **Tabla `prescription`** ↔ `CreatePrescriptionDto`: ✅ Alineado (corregido default de `reminder_enabled`)
- **Tabla `medication_dose_log`** ↔ DTOs de dosis: ✅ Correspondencia exacta
- **Tabla `medication_skip_reason_catalog`** ↔ DTOs de motivos: ✅ CRUD completo
- **Enum `medication_dose_status`** ↔ `MedicationDoseStatus`: ✅ Correspondencia exacta

**CORRECCIÓN APLICADA:**

- Campo `reminder_enabled` en CreatePrescriptionDto: default cambiado de `false` a `true` para coincidir con schema.

## Compatibilidad

- **Backward Compatibility**: Todos los DTOs existentes mantienen compatibilidad
- **Progressive Enhancement**: Los nuevos campos son opcionales donde corresponde
- **Type Safety**: Uso extensivo de TypeScript para type safety
- **Validation**: Validaciones robustas en todos los DTOs

## Próximos Pasos

Esta implementación de DTOs prepara la infraestructura para:

1. **FASE 3**: Implementación de servicios (PrescriptionService extensión, MedicationTrackingService, MedicationReminderService)
2. **FASE 4**: Controladores y endpoints REST
3. **FASE 5**: Testing y validación

## Archivo de Exportación

Todos los DTOs se exportan centralizadamente desde `index.ts` para facilitar imports:

```typescript
import {
  CreatePrescriptionDto,
  ActivateMedicationTrackingDto,
  MedicationDoseStatus,
  // ... otros DTOs
} from './dto';
```
