# Horario del Médico Endpoints

Este documento describe los endpoints para gestionar los horarios y excepciones de los médicos.

**Todos los endpoints en este módulo requieren el header `tenant_id`.**

## Endpoints

### `GET /physicians/{userId}/schedule`

Obtiene todas las entradas de horario para un médico específico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Responses:**

- `200 OK`: Entradas de horario recuperadas exitosamente.
- `403 Forbidden`: Acceso denegado.

### `GET /physicians/schedule/{id}`

Obtiene una entrada de horario específica por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID de la entrada de horario.

**Responses:**

- `200 OK`: Entrada de horario recuperada exitosamente.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Entrada de horario no encontrada.

### `POST /physicians/{userId}/schedule`

Crea o actualiza múltiples entradas de horario para un médico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Request Body:** `BulkCreateScheduleDto`

```json
{
  "schedules": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00",
      "appointment_length": 30,
      "simultaneous_slots": 1,
      "break_between": 0,
      "rest_start": "12:00",
      "rest_end": "13:00",
      "is_working_day": true,
      "modality": "Presencial",
      "office_id": "string (opcional)"
    }
  ]
}
```

**Responses:**

- `201 Created`: Entradas de horario creadas/actualizadas exitosamente.
- `400 Bad Request`: Solicitud inválida.
- `403 Forbidden`: Acceso denegado.

### `DELETE /physicians/schedule/{id}`

Elimina una entrada de horario por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID de la entrada de horario.

**Responses:**

- `200 OK`: Entrada de horario eliminada exitosamente.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Entrada de horario no encontrada.

### `DELETE /physicians/{userId}/schedule`

Elimina todas las entradas de horario para un médico específico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Responses:**

- `200 OK`: Todas las entradas de horario eliminadas exitosamente.
- `403 Forbidden`: Acceso denegado.

### `GET /physicians/{userId}/exceptions`

Obtiene todas las excepciones para un médico específico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Responses:**

- `200 OK`: Excepciones recuperadas exitosamente.
- `403 Forbidden`: Acceso denegado.

### `POST /physicians/{userId}/exceptions`

Crea una nueva excepción para un médico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Request Body:** `CreateExceptionDto`

```json
{
  "date": "2024-12-25",
  "is_available": false,
  "reason": "Christmas Day" // Campo opcional
}
```

O, sin el campo opcional:

```json
{
  "date": "2024-11-01",
  "is_available": false
}
```

**Responses:**

- `201 Created`: Excepción creada exitosamente.
- `400 Bad Request`: Solicitud inválida.
- `403 Forbidden`: Acceso denegado.

### `DELETE /physicians/exceptions/{id}`

Elimina una excepción por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID de la excepción.

**Responses:**

- `200 OK`: Excepción eliminada exitosamente.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Excepción no encontrada.

### `GET /physicians/{userId}/slots`

Obtiene los horarios disponibles para un médico en una fecha o rango de fechas específico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `userId` (string): ID del usuario médico.

**Query Parameters:**

- `date` (string, required): Fecha para verificar los horarios (YYYY-MM-DD).
- `endDate` (string, optional): Fecha final opcional para un rango (YYYY-MM-DD).

**Responses:**

- `200 OK`: Horarios disponibles recuperados exitosamente.
- `403 Forbidden`: Acceso denegado.
