# Estudios del Paciente Endpoints

Este documento describe los endpoints para gestionar los estudios de los pacientes.

**Todos los endpoints en este módulo requieren el header `tenant_id`.**

## Endpoints

### `POST /patient-studies`

Crea un nuevo estudio para un paciente.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Request Body:**

```json
{
  "medicalEventId": "string (ID del evento médico)",
  "study_type": "string (Tipo de estudio)",
  "study_date": "string (Fecha del estudio ISO 8601)",
  "institution": "string (Institución, opcional)",
  "study_file": "string (URL/ruta del archivo del estudio, opcional)",
  "user_id": "number (ID del usuario que crea)"
}
```

**Responses:**

- `201 Created`: El estudio del paciente ha sido creado exitosamente.
- `400 Bad Request`: La solicitud es inválida.
- `403 Forbidden`: Acceso denegado.

### `GET /patient-studies`

Obtiene todos los estudios de los pacientes.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Responses:**

- `200 OK`: Lista de todos los estudios de los pacientes.
  ```json
  [
    {
      "id": "string",
      "medicalEventId": "string",
      "study_type": "string",
      "study_date": "string",
      "institution": "string",
      "study_file": "string",
      "user_id": "number",
      "created_at": "string",
      "updated_at": "string",
      "tenant_id": "string"
    }
  ]
  ```
- `403 Forbidden`: Acceso denegado.

### `GET /patient-studies/{id}`

Obtiene un estudio de paciente específico por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID del estudio del paciente.

**Responses:**

- `200 OK`: Detalles del estudio del paciente.
  ```json
  {
    "id": "string",
    "medicalEventId": "string",
    "study_type": "string",
    "study_date": "string",
    "institution": "string",
    "study_file": "string",
    "user_id": "number",
    "created_at": "string",
    "updated_at": "string",
    "tenant_id": "string"
  }
  ```
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Estudio del paciente no encontrado.

### `PATCH /patient-studies/{id}`

Actualiza un estudio de paciente específico por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID del estudio del paciente a actualizar.

**Request Body:**

```json
{
  "study_type": "string (opcional)",
  "study_date": "string (opcional)",
  "institution": "string (opcional)",
  "study_file": "string (opcional)"
}
```

**Responses:**

- `200 OK`: El estudio del paciente ha sido actualizado exitosamente.
- `400 Bad Request`: La solicitud es inválida.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Estudio del paciente no encontrado.

### `DELETE /patient-studies/{id}`

Elimina un estudio de paciente específico por su ID.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (string): ID del estudio del paciente a eliminar.

**Responses:**

- `200 OK`: El estudio del paciente ha sido eliminado exitosamente.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Estudio del paciente no encontrado.
