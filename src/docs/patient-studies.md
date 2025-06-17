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

### `GET /patient-studies/my-studies` 🆕

**Nuevo endpoint principal con soporte multitenant para pacientes**

Obtiene todos los estudios del paciente autenticado considerando todas las organizaciones asociadas. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `tenant_id` (string, required): ID del tenant.
- `Authorization` (string, required): Bearer token JWT.

**Permisos requeridos:**

- `VIEW_OWN_MEDICAL_RECORDS`: Ver registros médicos propios.

**Funcionalidad Multitenant:**

Este endpoint busca estudios del paciente autenticado en **todas las organizaciones** a las que pertenece:

1. **Extrae el patient_id**: Directamente del JWT token (req.user.id)
2. **Si hay tenants en el JWT**: Usa esos tenant IDs directamente
3. **Si no**: Consulta la tabla `patient_tenant` para obtener todas las organizaciones del paciente
4. **Busca estudios** en todas esas organizaciones usando `tenant_id: { in: tenantIds }`

**Validaciones:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Datos propios**: Solo puede ver sus propios estudios

**Responses:**

- `200 OK`: Lista de estudios del paciente de todas sus organizaciones.
  ```json
  [
    {
      "id": "uuid-study",
      "patient_id": "uuid-patient",
      "title": "Radiografía de Tórax",
      "description": "Estudio de rutina",
      "study_type": "Radiología",
      "study_date": "2024-01-15T00:00:00Z",
      "institution": "Hospital Central",
      "study_file": "https://example.com/study.pdf",
      "tenant_id": "uuid-organization",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
  ```
- `400 Bad Request`: Usuario no es paciente o solicitud inválida.
- `401 Unauthorized`: Token JWT inválido o faltante.
- `403 Forbidden`: Permisos insuficientes.

**Ejemplo de uso:**

```bash
GET /patient-studies/my-studies
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
tenant-id: a6ad57c4-0e0c-4fcd-9aad-ca6bf1ba8796
```

### `GET /patient-studies/by-patient/{patient_id}`

**Endpoint para profesionales de la salud**

Obtiene todos los estudios de un paciente específico. Este endpoint está destinado a profesionales de la salud que necesitan consultar estudios de sus pacientes.

**Headers:**

- `tenant_id` (string, required): ID del tenant.
- `Authorization` (string, required): Bearer token JWT.

**Permisos requeridos:**

- `VIEW_PATIENT_DETAILS`: Ver detalles de pacientes.

**Path Parameters:**

- `patient_id` (string): ID del paciente.

**Responses:**

- `200 OK`: Lista de estudios del paciente.
- `400 Bad Request`: Solicitud inválida.
- `403 Forbidden`: Acceso denegado.
- `404 Not Found`: Paciente no encontrado.

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

## Cambios de Multitenant

### Mejoras Implementadas

1. **Endpoint principal corregido**: `GET /patient-studies/my-studies` - Usa JWT automáticamente
2. **Endpoint para profesionales**: `GET /patient-studies/by-patient/{patient_id}` - Para médicos
3. **Lógica optimizada**: Prioriza tenants del JWT antes que consultar la base de datos
4. **Seguridad mejorada**: Los pacientes solo pueden ver sus propios datos
5. **Consistencia**: Sigue el mismo patrón de multitenant usado en mobile appointments

### Diferencia entre Endpoints

| Endpoint           | Usuario               | Propósito                 | Requiere patient_id |
| ------------------ | --------------------- | ------------------------- | ------------------- |
| `/my-studies`      | Pacientes             | Ver estudios propios      | ❌ (desde JWT)      |
| `/by-patient/{id}` | Médicos/Profesionales | Ver estudios de pacientes | ✅ (parámetro)      |

### Métodos de Servicio Actualizados

- `findByPatientId()`: Ahora acepta `userTenants` opcional para soporte multitenant
- `getPatientTenantIds()`: Nuevo método privado para obtener tenant IDs del paciente

### Integración con otros módulos

- **Patient Service**: Actualizado para buscar estudios en todas las organizaciones del paciente
- **Mobile Functions**: Compatible con la arquitectura móvil existente
- **Authentication**: Utiliza tenants del JWT cuando están disponibles
- **Authorization**: Diferentes permisos para pacientes vs profesionales

## Casos de Uso

### Para Pacientes (Aplicación Móvil)

```bash
# Ver mis estudios de todas las organizaciones
GET /patient-studies/my-studies
Authorization: Bearer <patient-jwt-token>
```

### Para Profesionales de la Salud

```bash
# Ver estudios de un paciente específico
GET /patient-studies/by-patient/uuid-paciente
Authorization: Bearer <physician-jwt-token>
```
