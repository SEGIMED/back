# Módulo de Eventos Médicos

## Descripción

El módulo de Eventos Médicos gestiona la creación, consulta y atención de eventos médicos asociados a citas de pacientes. Un evento médico registra los detalles clínicos de una consulta o interacción médica.

**Nota Importante:** La gestión de medicaciones durante las consultas médicas está centralizada en el `PrescriptionService` para garantizar consistencia con el resto del sistema y mantener un historial unificado de prescripciones.

## Utilidad

Este módulo es crucial para registrar la información clínica generada durante una consulta, como diagnósticos, comentarios del médico, procedimientos, tratamientos y signos vitales. Esta información es fundamental para el seguimiento del paciente y la continuidad de la atención.

## Arquitectura de Medicaciones

### Procesamiento Integrado

Durante la atención de eventos médicos, el procesamiento de medicaciones utiliza:

- **PrescriptionService.processMedications()**: Mismo método centralizado usado por las órdenes médicas
- **Transacciones**: Todas las operaciones (evento médico + medicaciones) se ejecutan en una sola transacción
- **Consistencia**: Las medicaciones prescritas en consultas se integran automáticamente con el historial global del paciente
- **Autorización Automática**: Las medicaciones prescritas durante consultas se marcan como autorizadas por defecto

### Flujo de Atención

1. **Actualización del Evento**: Se actualizan los datos clínicos del evento médico
2. **Procesamiento de Medicaciones**: Se procesan las medicaciones usando el servicio centralizado
3. **Notificaciones**: Si la consulta finaliza, se envían notificaciones al paciente
4. **Finalización**: Se actualiza el estado de la cita asociada

## Endpoints

Todos los endpoints de este módulo requieren los siguientes headers:

- `Authorization`: `Bearer <JWT_TOKEN>` (Token de autenticación del usuario)
- `X-Tenant-ID`: `<TENANT_UUID>` (Identificador único del tenant/organización)

---

### POST /medical-events

Crea un nuevo evento médico. Este endpoint se utiliza generalmente al iniciar una consulta o registrar un evento médico básico.

**Permisos Requeridos:** Acceso autenticado dentro del tenant.

**Body de la Petición (`CreateMedicalEventDto`):**

```json
{
  "appointment_id": "uuid-del-appointment",
  "patient_id": "uuid-del-paciente",
  "physician_id": "uuid-del-medico",
  "physician_comments": "Comentarios iniciales del médico.",
  "main_diagnostic_cie": "A00.1",
  "evolution": "Evolución inicial del paciente.",
  "procedure": "Procedimiento inicial realizado.",
  "treatment": "Tratamiento inicial indicado."
}
```

**Ejemplo de Petición:**

```http
POST /medical-events
Host: localhost:3000
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <TENANT_UUID>
Content-Type: application/json

{
  "appointment_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "patient_id": "b5191b80-2a8d-4eb2-9958-9273a0708025",
  "physician_id": "dbacf6c6-6918-41e0-8923-4de0ce59eb84",
  "physician_comments": "Paciente refiere dolor abdominal agudo.",
  "main_diagnostic_cie": "R10.4"
}
```

**Respuesta Exitosa (201 Created):**

```json
{
  "message": "El evento médico ha sido creado exitosamente."
  // La respuesta puede incluir el objeto del evento médico creado, por ejemplo:
  // "id": "uuid-del-nuevo-evento-medico",
  // "appointment_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  // ...otros campos
}
```

**Respuesta de Error (ej. 400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": ["appointment_id must be a UUID"],
  "error": "Bad Request"
}
```

**Respuesta de Error (ej. 500 Internal Server Error - Foreign Key Constraint):**

```json
{
  "message": "Error al crear el evento médico: Foreign key constraint violated: `medical_event_appointment_id_fkey (index)`",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

(Esto indica que el `appointment_id` proporcionado no existe en la base de datos.)

---

### GET /medical-events

Obtiene una lista de eventos médicos, con opciones de filtrado y paginación.

**Permisos Requeridos:** Acceso autenticado dentro del tenant.

**Parámetros de Query:**

- `patient_id` (string, opcional): Filtrar por ID del paciente (UUID).
- `physician_id` (string, opcional): Filtrar por ID del médico (UUID).
- `page` (number, opcional): Número de página para paginación.
- `pageSize` (number, opcional): Número de eventos por página.
- `orderBy` (string, opcional): Campo por el cual ordenar (ej. `created_at`).
- `orderDirection` (string, opcional): Dirección de ordenamiento (`asc` o `desc`).

**Ejemplo de Petición:**

```http
GET /medical-events?patient_id=b5191b80-2a8d-4eb2-9958-9273a0708025&pageSize=10&page=1
Host: localhost:3000
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <TENANT_UUID>
```

**Respuesta Exitosa (200 OK):**

```json
[
  {
    "id": "event-uuid-1",
    "appointment_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "patient_id": "b5191b80-2a8d-4eb2-9958-9273a0708025",
    "physician_id": "dbacf6c6-6918-41e0-8923-4de0ce59eb84",
    "physician_comments": "Comentarios del médico.",
    "main_diagnostic_cie": "A00.1",
    "evolution": "Evolución del paciente.",
    "procedure": "Procedimiento realizado.",
    "treatment": "Tratamiento indicado.",
    "created_at": "2024-05-22T10:00:00.000Z",
    "updated_at": "2024-05-22T10:05:00.000Z"
    // ... otros campos si el evento ha sido "atendido"
  }
  // ... más eventos médicos
]
```

**Respuesta de Error (ej. 401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### POST /medical-events/attend

Registra la atención detallada de un evento médico existente. Esto incluye signos vitales, exploraciones físicas, medicaciones, etc.

**Permisos Requeridos:** `Permission.ASSIGN_TREATMENTS`

**Body de la Petición (`AttendMedicalEventDto`):**

```json
{
  "id": "uuid-del-evento-medico-a-atender",
  "physician_comments": "Comentarios actualizados del médico durante la atención.",
  "main_diagnostic_cie": "A00.1", // Puede ser el mismo o actualizado
  "evolution": "Evolución detallada del paciente.",
  "procedure": "Procedimientos realizados durante la atención.",
  "treatment": "Tratamiento detallado y/o actualizado.",
  "vital_signs": [
    { "vital_sign_id": 1, "measure": 120 }, // ej. Presión Arterial Sistólica
    { "vital_sign_id": 2, "measure": 80 } // ej. Presión Arterial Diastólica
  ],
  "subcategory_cie_ids": [10, 15], // IDs de subcategorías CIE
  "physical_explorations": [
    {
      "physical_exploration_area_id": 3,
      "description": "Abdomen blando, no doloroso."
    }
  ],
  "physical_examinations": [
    {
      "physical_subsystem_id": 5,
      "description": "Murmullo vesicular conservado en ambos campos pulmonares."
    }
  ],
  "medications": [
    {
      "monodrug": "Paracetamol",
      "dose": "500",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "3",
      "duration_units": "días",
      "observations": "Tomar con alimentos."
    }
  ],
  "consultation_ended": true
}
```

**Ejemplo de Petición:**

```http
POST /medical-events/attend
Host: localhost:3000
Authorization: Bearer <JWT_TOKEN>
X-Tenant-ID: <TENANT_UUID>
Content-Type: application/json

{
  "id": "event-uuid-1",
  "physician_comments": "Se actualizan comentarios. Paciente estable.",
  "vital_signs": [
    { "vital_sign_id": 1, "measure": 120 },
    { "vital_sign_id": 2, "measure": 80 },
    { "vital_sign_id": 3, "measure": 36.5 }
  ],
  "medications": [
    {
      "monodrug": "Ibuprofeno",
      "dose": "400",
      "dose_units": "mg",
      "frecuency": "Cada 6 horas",
      "duration": "2",
      "duration_units": "días",
      "observations": "Si persiste el dolor."
    }
  ],
  "consultation_ended": true
}
```

**Respuesta Exitosa (201 Created/OK):**
(La documentación Swagger indica 201, pero una actualización podría ser 200 OK)

```json
{
  "message": "El evento médico ha sido atendido exitosamente."
  // Podría devolver el evento médico actualizado
}
```

**Respuesta de Error (ej. 400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": [
    "id must be a UUID",
    "vital_signs.0.vital_sign_id must be an integer number"
  ],
  "error": "Bad Request"
}
```

**Respuesta de Error (ej. 403 Forbidden):**

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

(Si el usuario no tiene el permiso `Permission.ASSIGN_TREATMENTS`)

---

## DTOs Detallados

### `CreateMedicalEventDto`

Usado para crear un evento médico.

- `appointment_id: string` (UUID, Requerido) - ID de la cita asociada.
- `patient_id: string` (UUID, Requerido) - ID del paciente.
- `physician_id: string` (UUID, Requerido) - ID del médico.
- `physician_comments?: string` (Opcional) - Comentarios del médico.
- `main_diagnostic_cie?: string` (Opcional) - Código CIE del diagnóstico principal.
- `evolution?: string` (Opcional) - Evolución del paciente.
- `procedure?: string` (Opcional) - Procedimientos realizados.
- `treatment?: string` (Opcional) - Tratamiento indicado.

### `AttendMedicalEventDto`

Usado para registrar la atención detallada de un evento médico.

- `id: string` (UUID, Requerido) - ID del evento médico a atender.
- `physician_comments?: string` (Opcional)
- `main_diagnostic_cie?: string` (Opcional)
- `evolution?: string` (Opcional)
- `procedure?: string` (Opcional)
- `treatment?: string` (Opcional)
- `vital_signs?: VitalSignItemDto[]` (Opcional) - Lista de signos vitales.
- `subcategory_cie_ids?: number[]` (Opcional) - Lista de IDs de subcategorías CIE.
- `physical_explorations?: PhysicalExplorationItemDto[]` (Opcional) - Lista de exploraciones físicas.
- `physical_examinations?: PhysicalExaminationItemDto[]` (Opcional) - Lista de exámenes físicos.
- `medications?: MedicationItemDto[]` (Opcional) - Lista de medicaciones.
- `consultation_ended?: boolean` (Opcional) - Indica si la consulta ha finalizado.

#### `VitalSignItemDto`

- `vital_sign_id: number` (Requerido) - ID del tipo de signo vital (del catálogo).
- `measure: number` (Requerido) - Medida del signo vital.

#### `PhysicalExplorationItemDto`

- `physical_exploration_area_id: number` (Requerido) - ID del área de exploración física (del catálogo).
- `description: string` (Requerido) - Descripción de la exploración.

#### `PhysicalExaminationItemDto`

- `physical_subsystem_id?: number` (Opcional) - ID del subsistema físico (del catálogo).
- `description: string` (Requerido) - Descripción del examen.

#### `MedicationItemDto`

- `monodrug: string` (Requerido) - Nombre del monodroga.
- `dose: string` (Requerido) - Dosis.
- `dose_units: string` (Requerido) - Unidades de la dosis (ej. "mg", "ml").
- `frecuency: string` (Requerido) - Frecuencia de administración (ej. "Cada 8 horas").
- `duration: string` (Requerido) - Duración del tratamiento (ej. "7").
- `duration_units: string` (Requerido) - Unidades de la duración (ej. "días", "semanas").
- `observations?: string` (Opcional) - Observaciones adicionales.
