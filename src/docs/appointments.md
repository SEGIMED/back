# Documentación de API: Appointments

Este documento proporciona detalles sobre los endpoints del módulo de Appointments (Citas) disponibles en la API de Segimed.

## Información General

- **Base URL**: `/appointments`
- **Controlador**: `AppointmentsController`
- **Servicios Relacionados**: `AppointmentsService`
- **Autenticación**: Requiere un token Bearer de acceso JWT
- **Tenant**: Requiere un header `tenant-id` que especifica el ID del inquilino

## Permisos Requeridos

Los endpoints en este módulo requieren los siguientes permisos:

- `SCHEDULE_APPOINTMENTS`: Para programar y gestionar citas
- `VIEW_DOCTOR_DETAILS`: Para ver los calendarios de médicos
- `VIEW_STATISTICS`: Para acceder a las estadísticas de citas

## Endpoints

### 1. Crear Cita

Crea una nueva cita en el sistema.

- **URL**: `POST /appointments`
- **Permisos**: `SCHEDULE_APPOINTMENTS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Body**:
  ```json
  {
    "consultation_reason": "String (requerido) - Razón de la consulta",
    "start": "Date (requerido) - Fecha y hora de inicio (ISO format)",
    "end": "Date (requerido) - Fecha y hora de fin (ISO format)",
    "patient_id": "UUID (requerido) - ID del paciente",
    "physician_id": "UUID (requerido) - ID del médico",
    "status": "Enum (opcional) - Estado de la cita [atendida, cancelada, pendiente]",
    "comments": "String (opcional) - Comentarios adicionales"
  }
  ```
- **Respuestas**:
  - `201 Created`: Cita creada correctamente
  - `400 Bad Request`: Datos de cita inválidos
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

### 2. Obtener Citas del Usuario

Devuelve las citas asociadas al usuario actual con estructura paginada.

- **URL**: `GET /appointments/user`
- **Permisos**: `SCHEDULE_APPOINTMENTS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Parámetros de consulta**:
  - `status` (opcional): Filtrar por estado (`atendida`, `cancelada`, `pendiente`)
  - `page` (opcional): Número de página para paginación
  - `limit` (opcional): Número de elementos por página
  - `specialty_id` (opcional): ID de la especialidad médica para filtrar citas
- **Respuesta exitosa** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "uuid-cita",
        "consultation_reason": "Consulta de control",
        "start": "2025-07-08T10:00:00.000Z",
        "end": "2025-07-08T10:30:00.000Z",
        "patient_id": "uuid-paciente",
        "physician_id": "uuid-medico",
        "status": "pendiente",
        "comments": "Revisión mensual",
        "tenant_id": "uuid-tenant",
        "created_at": "2025-07-08T09:00:00.000Z",
        "updated_at": "2025-07-08T09:15:00.000Z",
        "patient": {
          "name": "Juan Carlos",
          "last_name": "Pérez García",
          "email": "juan.perez@email.com"
        },
        "physician": {
          "name": "Dr. María",
          "last_name": "González López"
        }
      }
    ],
    "total": 25
  }
  ```
- **Otras respuestas**:
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

### 3. Actualizar Estado de Cita

Actualiza el estado de una cita existente.

- **URL**: `PATCH /appointments/:id/status`
- **Permisos**: `SCHEDULE_APPOINTMENTS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Parámetros de ruta**:
  - `id`: ID de la cita
- **Body**:
  ```json
  {
    "status": "Enum (requerido) - Nuevo estado [atendida, cancelada, pendiente]",
    "reason": "String (opcional) - Razón del cambio de estado"
  }
  ```
- **Respuestas**:
  - `200 OK`: Estado de la cita actualizado correctamente
  - `400 Bad Request`: Datos inválidos
  - `404 Not Found`: Cita no encontrada
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

### 4. Calendario del Médico Actual

Devuelve los datos de calendario para el médico actual.

- **URL**: `GET /appointments/physician-calendar`
- **Permisos**: `VIEW_DOCTOR_DETAILS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio (ISO format)
  - `endDate` (opcional): Fecha de fin (ISO format)
  - `status` (opcional): Filtrar por estado (`atendida`, `cancelada`, `pendiente`)
  - `month` (opcional): Mes para el calendario (1-12)
  - `year` (opcional): Año para el calendario
- **Respuestas**:
  - `200 OK`: Calendario devuelto correctamente
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

### 5. Calendario de un Médico Específico

Devuelve los datos de calendario para un médico específico.

- **URL**: `GET /appointments/physician/:physicianId/calendar`
- **Permisos**: `VIEW_DOCTOR_DETAILS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Parámetros de ruta**:
  - `physicianId`: ID del médico
- **Parámetros de consulta**:
  - `startDate` (opcional): Fecha de inicio (ISO format)
  - `endDate` (opcional): Fecha de fin (ISO format)
  - `status` (opcional): Filtrar por estado (`atendida`, `cancelada`, `pendiente`)
  - `month` (opcional): Mes para el calendario (1-12)
  - `year` (opcional): Año para el calendario
- **Respuestas**:
  - `200 OK`: Calendario devuelto correctamente
  - `404 Not Found`: Médico no encontrado
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

### 6. Estadísticas de Citas

Devuelve estadísticas sobre las citas.

- **URL**: `GET /appointments/statistics`
- **Permisos**: `VIEW_STATISTICS`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Parámetros de consulta (requeridos)**:
  - `type`: Tipo de estadísticas a recuperar (enum):
    - `appointments_by_status`: Citas por estado
    - `appointments_by_day`: Citas por día
    - `appointments_by_month`: Citas por mes
    - `appointments_by_physician`: Citas por médico
    - `diagnoses_distribution`: Distribución de diagnósticos
    - `consultations_count`: Recuento de consultas
    - `patient_demographics`: Demografía de pacientes
    - `attendance_rate`: Tasa de asistencia
    - `physician_workload`: Carga de trabajo del médico
    - `scheduling_trends`: Tendencias de programación
- **Parámetros de consulta (opcionales)**:
  - `startDate`: Fecha de inicio (ISO format)
  - `endDate`: Fecha de fin (ISO format)
  - `groupBy`: Cómo agrupar estadísticas (enum):
    - `day`: Por día
    - `week`: Por semana
    - `month`: Por mes
    - `quarter`: Por trimestre
    - `year`: Por año
    - `physician`: Por médico
    - `patient`: Por paciente
    - `status`: Por estado
    - `specialty`: Por especialidad
    - `diagnosis`: Por diagnóstico
  - `physicianId`: Filtrar por ID de médico
  - `patientId`: Filtrar por ID de paciente
  - `specialtyId`: Filtrar por ID de especialidad
  - `limit`: Limitar número de resultados
  - `filter`: Criterios de filtro adicionales
- **Respuestas**:
  - `200 OK`: Estadísticas devueltas correctamente
  - `401 Unauthorized`: No autorizado
  - `403 Forbidden`: Permisos insuficientes

## Modelos de Datos

### CreateAppointmentDto

```typescript
{
  consultation_reason: string; // Razón de la consulta (requerido)
  start: Date; // Fecha/hora de inicio (requerido, formato ISO)
  end: Date; // Fecha/hora de fin (requerido, formato ISO)
  patient_id: string; // UUID del paciente (requerido)
  physician_id: string; // UUID del médico (requerido)
  status?: status_type; // Estado (opcional): atendida, cancelada, pendiente
  comments?: string; // Comentarios (opcional)
  tenant_id?: string; // ID del tenant (opcional, UUID)
}
```

### GetAppointmentsCalendarDto

```typescript
{
  startDate?: string; // Fecha de inicio (formato ISO)
  endDate?: string; // Fecha de fin (formato ISO)
  view?: 'dia' | 'semana' | 'mes'; // Vista del calendario (default: 'semana')
  status?: status_type; // Estado: atendida, cancelada, pendiente
  month?: number; // Mes (1-12)
  year?: number; // Año
}
```

### GetStatisticsDto

```typescript
{
  type: StatisticsType; // Tipo de estadísticas (requerido, ver enumeraciones)
  startDate?: string; // Fecha de inicio (formato ISO)
  endDate?: string; // Fecha de fin (formato ISO)
  groupBy?: GroupBy; // Cómo agrupar las estadísticas
  limit?: number; // Límite de resultados
  physicianId?: string; // Filtro por ID de médico (UUID)
  patientId?: string; // Filtro por ID de paciente (UUID)
  specialtyId?: number; // Filtro por ID de especialidad
  filter?: string; // Criterios de filtro adicionales
}
```

## Enumeraciones

### StatisticsType

- `appointments_by_status`: Citas por estado
- `appointments_by_day`: Citas por día
- `appointments_by_month`: Citas por mes
- `appointments_by_physician`: Citas por médico
- `diagnoses_distribution`: Distribución de diagnósticos
- `consultations_count`: Recuento de consultas
- `patient_demographics`: Demografía de pacientes
- `attendance_rate`: Tasa de asistencia
- `physician_workload`: Carga de trabajo del médico
- `scheduling_trends`: Tendencias de programación

### GroupBy

- `day`: Por día
- `week`: Por semana
- `month`: Por mes
- `quarter`: Por trimestre
- `year`: Por año
- `physician`: Por médico
- `patient`: Por paciente
- `status`: Por estado
- `specialty`: Por especialidad
- `diagnosis`: Por diagnóstico

### status_type

- `atendida`: Cita atendida
- `cancelada`: Cita cancelada
- `pendiente`: Cita pendiente
