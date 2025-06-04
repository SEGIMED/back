# Mobile Appointments API

Este documento describe los endpoints de citas médicas para la aplicación móvil.

**Todos los endpoints requieren autenticación JWT y están dirigidos específicamente a pacientes. El ID del paciente se extrae automáticamente del JWT token.**

## Endpoints

### `GET /mobile/appointments`

Obtiene las citas del paciente autenticado. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `Authorization` (string, required): Bearer token JWT del paciente.

**Permisos requeridos:**

- `VIEW_OWN_APPOINTMENTS`: Ver citas propias.

**Query Parameters:**

- `home` (boolean, optional):
  - `true`: Devuelve solo la próxima cita pendiente
  - `false` o no especificado: Devuelve todas las citas agrupadas

**Validaciones Automáticas:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Datos propios**: Solo puede ver sus propias citas (patient_id desde JWT)

**Funcionalidad Multitenant:**

Este endpoint busca citas del paciente autenticado en **todas las organizaciones** a las que pertenece:

1. **Extrae el patient_id**: Directamente del JWT token (req.user.id)
2. **Obtiene tenant IDs**: Del JWT o consultando `patient_tenant` en la base de datos
3. **Busca citas**: En todas las organizaciones usando `tenant_id: { in: tenantIds }`
4. **Incluye especialidades**: Obtiene la especialidad de cada médico de forma optimizada

**Responses:**

#### Próxima cita (`home=true`)

- `200 OK`: Próxima cita pendiente.
  ```json
  {
    "next_appointment": {
      "id": "uuid-cita",
      "start": "2024-01-15T10:00:00Z",
      "status": "pendiente",
      "physician": {
        "id": "uuid-medico",
        "name": "Santiago",
        "last_name": "Pérez",
        "image": "https://example.com/doctor.jpg",
        "specialty": "Cardiología"
      }
    },
    "message": "Próxima cita encontrada exitosamente"
  }
  ```

#### Todas las citas (`home=false`)

- `200 OK`: Todas las citas agrupadas por estado.
  ```json
  {
    "appointments": {
      "pending": [
        {
          "id": "uuid-cita-1",
          "start": "2024-01-15T10:00:00Z",
          "status": "pendiente",
          "physician": {
            "id": "uuid-medico-1",
            "name": "Santiago",
            "last_name": "Pérez",
            "image": "https://example.com/doctor1.jpg",
            "specialty": "Cardiología"
          }
        }
      ],
      "past": [
        {
          "id": "uuid-cita-2",
          "start": "2024-01-10T09:00:00Z",
          "status": "atendida",
          "physician": {
            "id": "uuid-medico-2",
            "name": "María",
            "last_name": "González",
            "image": "https://example.com/doctor2.jpg",
            "specialty": "Neurología"
          }
        }
      ],
      "pending_count": 1,
      "past_count": 1
    },
    "message": "Citas obtenidas exitosamente"
  }
  ```

**Error Responses:**

- `400 Bad Request`: Usuario no es paciente o solicitud inválida.
- `401 Unauthorized`: Token JWT inválido o faltante.
- `403 Forbidden`: No tiene permisos para ver citas.

### `PATCH /mobile/appointments/{appointment_id}/cancel` 🆕

**Nuevo endpoint para cancelar citas**

Permite al paciente autenticado cancelar sus propias citas pendientes. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `Authorization` (string, required): Bearer token JWT del paciente.

**Permisos requeridos:**

- `VIEW_OWN_APPOINTMENTS`: Ver citas propias (se reutiliza para cancelación).

**Path Parameters:**

- `appointment_id` (string): ID de la cita a cancelar.

**Request Body:**

```json
{
  "reason": "string (Razón de cancelación, opcional)"
}
```

**Ejemplo:**

```json
{
  "reason": "No puedo asistir por motivos personales"
}
```

**Validaciones:**

- `reason`: Opcional, string máximo 500 caracteres

**Validaciones Automáticas:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Cita propia**: La cita debe pertenecer al paciente autenticado
- ✅ **Cita pendiente**: Solo se pueden cancelar citas con status 'pendiente'
- ✅ **Cita futura**: No se pueden cancelar citas pasadas
- ✅ **Multitenant**: Busca en todas las organizaciones del paciente

**Funcionalidad Multitenant:**

Este endpoint también maneja multitenant automáticamente:

1. **Extrae el patient_id**: Directamente del JWT token (req.user.id)
2. **Verifica pertenencia**: La cita debe pertenecer al paciente en alguna de sus organizaciones
3. **Valida estado**: Solo permite cancelar citas pendientes
4. **Valida temporalidad**: Solo permite cancelar citas futuras
5. **Actualiza estado**: Cambia el status a 'cancelada' y guarda la razón

**Responses:**

- `200 OK`: Cita cancelada exitosamente.
  ```json
  {
    "id": "uuid-cita",
    "status": "cancelada",
    "start": "2024-01-15T10:00:00Z",
    "physician": {
      "name": "Santiago",
      "last_name": "Pérez"
    },
    "message": "Cita cancelada exitosamente",
    "cancelled_reason": "No puedo asistir por motivos personales"
  }
  ```

**Error Responses:**

- `400 Bad Request`:
  - Usuario no es paciente
  - Cita no está pendiente
  - Cita ya pasó
  - Datos de entrada inválidos
- `401 Unauthorized`: Token JWT inválido o faltante.
- `403 Forbidden`: No tiene permisos para cancelar citas.
- `404 Not Found`: Cita no encontrada o no tienes permisos para cancelarla.

**Ejemplo de uso:**

```bash
PATCH /mobile/appointments/123e4567-e89b-12d3-a456-426614174000/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Tengo una emergencia familiar"
}
```

## Características Generales

### Autenticación y Autorización

- **JWT requerido**: Todos los endpoints requieren autenticación.
- **Solo pacientes**: Los endpoints están diseñados específicamente para usuarios con rol 'patient'.
- **Permisos mínimos**: Se requiere `VIEW_OWN_APPOINTMENTS` para todas las operaciones.
- **ID automático**: El patient_id se extrae automáticamente del JWT token.

### Funcionalidad Multitenant

Todos los endpoints manejan multitenant de forma transparente:

1. **Extrae patient_id**: Automáticamente del JWT token (req.user.id)
2. **Prioriza JWT**: Si hay tenants en el token, los usa directamente
3. **Fallback a DB**: Si no, consulta `patient_tenant` para obtener organizaciones
4. **Búsqueda inclusiva**: Busca datos en todas las organizaciones del paciente
5. **Optimización**: Minimiza consultas a la base de datos

### Optimizaciones de Rendimiento

- **Consultas batch**: Las especialidades se obtienen en una sola consulta
- **Mapeo eficiente**: Se usan Maps para relacionar datos de médicos y especialidades
- **Ordenamiento inteligente**: Citas pendientes ascendente, pasadas descendente
- **Filtros a nivel DB**: Las consultas incluyen filtros para reducir transferencia de datos

### Estados de Citas

- **pendiente**: Cita programada y confirmada
- **atendida**: Cita que ya se realizó
- **cancelada**: Cita cancelada por el paciente o médico
- **no_asistio**: Paciente no asistió a la cita

### Casos de Uso Móviles

#### Dashboard Principal (Home)

```bash
# Obtener próxima cita para mostrar en home
GET /mobile/appointments?home=true
Authorization: Bearer <patient-jwt-token>
```

#### Lista Completa de Citas

```bash
# Ver historial completo organizado
GET /mobile/appointments
Authorization: Bearer <patient-jwt-token>
```

#### Cancelación de Cita

```bash
# Cancelar con razón específica
PATCH /mobile/appointments/{id}/cancel
Authorization: Bearer <patient-jwt-token>
Content-Type: application/json

{
  "reason": "Conflicto de horario laboral"
}

# Cancelar sin razón específica
PATCH /mobile/appointments/{id}/cancel
Authorization: Bearer <patient-jwt-token>
Content-Type: application/json

{}
```

## Seguridad

### Validaciones Automáticas

Todos los endpoints realizan validaciones automáticas:

1. **Autenticación**: JWT válido y no expirado
2. **Autorización**: Usuario debe ser paciente (`role: 'patient'`)
3. **Ownership**: Solo puede acceder a sus propios datos
4. **Multitenant**: Acceso seguro a datos de todas sus organizaciones

### No Hay Exposición de IDs

- **Patient ID**: Se obtiene del JWT, no se expone en URLs
- **Tenant IDs**: Se manejan internamente, no requieren especificación manual
- **Seguridad**: Previene acceso no autorizado a datos de otros pacientes

## Integración con Otros Módulos

- **Authentication**: Usa JWT para identificar al paciente automáticamente
- **Patient Management**: Consulta organizaciones del paciente
- **Physician Management**: Obtiene datos y especialidades de médicos
- **Tenant Management**: Maneja multitenant de forma transparente
- **Appointment Scheduling**: Se integra con el sistema principal de citas

## Diferencias con APIs de Profesionales

| Aspecto         | Mobile API (Pacientes)   | Professional API (Médicos) |
| --------------- | ------------------------ | -------------------------- |
| **Patient ID**  | Del JWT automáticamente  | Parámetro en URL           |
| **Alcance**     | Solo datos propios       | Datos de sus pacientes     |
| **Multitenant** | Todas sus organizaciones | Su organización            |
| **Permisos**    | `VIEW_OWN_APPOINTMENTS`  | `VIEW_PATIENT_DETAILS`     |
