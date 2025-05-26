# Módulo de Prescripciones

## Descripción General

El módulo de Prescripciones se encarga de gestionar las recetas médicas emitidas para los pacientes. Permite crear, consultar y eliminar prescripciones, detallando información como el medicamento (monodroga), las fechas de inicio y fin, la descripción o indicaciones, y el estado de la prescripción.

Esta funcionalidad es esencial para el seguimiento del tratamiento farmacológico de los pacientes.

## Endpoints

### `POST /prescription`

Crea una nueva prescripción médica.

**Cuerpo de la Solicitud (Request Body):**

El cuerpo de la solicitud debe ser un objeto JSON que se ajuste al `CreatePrescriptionDto`.

```json
{
  "start_timestamp": "string (fecha ISO, opcional)",
  "end_timestamp": "string (fecha ISO, opcional)",
  "description": "string (opcional)",
  "active": "boolean (opcional, default: true)",
  "patient_id": "string (UUID, opcional)",
  "monodrug": "string",
  "tenant_id": "string (UUID, opcional)"
}
```

**Respuestas (Responses):**

- `201 Created` (Creado): Prescripción creada exitosamente.
  ```json
  {
    // Cuerpo de la respuesta del servidor tras la creación exitosa (CreatePrescriptionDto)
  }
  ```
- `400 Bad Request` (Solicitud Incorrecta): Entrada inválida. El cuerpo de la solicitud no se ajusta al esquema esperado o contiene datos inválidos.
- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `403 Forbidden` (Prohibido): El usuario no tiene los permisos necesarios para realizar esta acción.
- `500 Internal Server Error` (Error Interno del Servidor): Ocurrió un error inesperado en el servidor.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Identificador para el tenant, requerido)

**Ejemplo de Uso (cURL):**

```bash
curl -X POST \
  http://localhost:3000/prescription \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID' \
  -d '{
    "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "monodrug": "Amoxicilina 500mg",
    "description": "Tomar una cápsula cada 8 horas durante 7 días.",
    "start_timestamp": "2025-05-23T08:00:00.000Z",
    "end_timestamp": "2025-05-30T08:00:00.000Z",
    "active": true,
    "tenant_id": "tenant_organizacion_xyz"
  }'
```

### `GET /prescription/patient/:id`

Obtiene todas las prescripciones para un paciente específico.

**Parámetros de Ruta (Path Parameters):**

- `id`: UUID del paciente cuyas prescripciones se desean consultar.

**Respuestas (Responses):**

- `200 OK`: Devuelve un array con las prescripciones del paciente.
  ```json
  [
    {
      "id": "string (UUID)",
      "start_timestamp": "string (fecha ISO)",
      "end_timestamp": "string (fecha ISO)",
      "description": "string",
      "active": true,
      "patient_id": "string (UUID)",
      "monodrug": "string",
      "tenant_id": "string (UUID)"
      // ... y otros campos de la prescripción
    }
  ]
  ```
- `400 Bad Request` (Solicitud Incorrecta): ID de paciente inválido.
- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `403 Forbidden` (Prohibido): El usuario no tiene los permisos necesarios.
- `404 Not Found` (No Encontrado): No se encontró el paciente especificado.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso`
- `X-Tenant-ID`: `string` (requerido)

**Ejemplo de Uso (cURL):**

```bash
curl -X GET \
  http://localhost:3000/prescription/patient/a1b2c3d4-e5f6-7890-1234-567890abcdef \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID'
```

### `GET /prescription`

Obtiene todas las prescripciones (uso potencial para administradores o sistema).

**Respuestas (Responses):**

- `200 OK`: Devuelve un array con todas las prescripciones.
  ```json
  [
    {
      "id": "string (UUID)",
      "start_timestamp": "string (fecha ISO)"
      // ... más campos
    }
  ]
  ```
- `401 Unauthorized` (No Autorizado).
- `403 Forbidden` (Prohibido).

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso`
- `X-Tenant-ID`: `string` (opcional, dependiendo de la lógica de negocio para acceso global)

**Ejemplo de Uso (cURL):**

```bash
curl -X GET \
  http://localhost:3000/prescription \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  # -H 'X-Tenant-ID: TU_TENANT_ID' # Opcional
```

### `DELETE /prescription/:id`

Elimina una prescripción específica por su ID.

**Parámetros de Ruta (Path Parameters):**

- `id`: UUID de la prescripción a eliminar.

**Respuestas (Responses):**

- `200 OK`: Prescripción eliminada exitosamente.
- `400 Bad Request` (Solicitud Incorrecta): ID de prescripción inválido.
- `401 Unauthorized` (No Autorizado).
- `403 Forbidden` (Prohibido).
- `404 Not Found` (No Encontrado): No se encontró la prescripción especificada.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso`
- `X-Tenant-ID`: `string` (requerido para el contexto de eliminación)

**Ejemplo de Uso (cURL):**

```bash
curl -X DELETE \
  http://localhost:3000/prescription/abcdef01-2345-6789-abcd-ef0123456789 \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID'
```
