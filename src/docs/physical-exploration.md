# Módulo de Exploración Física

## Descripción General

El módulo de Exploración Física permite registrar los hallazgos detallados de las exploraciones físicas realizadas a los pacientes durante eventos médicos. Este módulo se integra con la información del paciente, el médico tratante y el evento médico específico para contextualizar los hallazgos.

Actualmente, el módulo se centra en la creación y actualización de registros de exploración física.

## Endpoints

### `POST /physical-explorations`

Crea un nuevo registro de exploración física o actualiza uno existente si se proporciona un `medical_event_id` que ya tiene una exploración asociada.

**Cuerpo de la Solicitud (Request Body):**

El cuerpo de la solicitud debe ser un objeto JSON que se ajuste al `CreatePhysicalExplorationDto` para la creación, o una estructura similar para la actualización (manejada por el mismo endpoint y DTO en este caso).

**Para Crear:**

```json
{
  "patient_id": "string (UUID)",
  "physician_id": "string (UUID)",
  "medical_event_id": "string (UUID, único para la creación)",
  "description": "string (max 500 caracteres)",
  "physical_exploration_area_id": "number (integer, min 1)",
  "tenant_id": "string (UUID)"
}
```

**Ejemplo de Creación:**

```json
{
  "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "physician_id": "b1c2d3e4-f5g6-7890-1234-567890abcdef",
  "medical_event_id": "c1d2e3f4-g5h6-7890-1234-567890abcdef",
  "description": "Paciente refiere dolor leve a la palpación en el cuadrante superior derecho del abdomen. No se observan masas ni visceromegalias.",
  "physical_exploration_area_id": 1,
  "tenant_id": "tid_abcdef123456"
}
```

**Para Actualizar (usando el mismo endpoint):**
Si se envía un `medical_event_id` que ya existe en la base de datos para una exploración física, el servicio interpretará la solicitud como una actualización de los campos proporcionados. El `UpdatePhysicalExplorationDto` formalmente omite `medical_event_id` del `PartialType` de `CreatePhysicalExplorationDto`, pero luego lo re-declara como obligatorio, lo que implica que el `medical_event_id` es clave para la operación de actualización.

**Ejemplo de Actualización:**

```json
{
  "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Puede o no ser necesario reenviar si no cambia
  "physician_id": "b1c2d3e4-f5g6-7890-1234-567890abcdef", // Puede o no ser necesario reenviar si no cambia
  "medical_event_id": "c1d2e3f4-g5h6-7890-1234-567890abcdef", // ID del evento médico existente a actualizar
  "description": "Actualización: Paciente refiere dolor moderado a la palpación en el cuadrante superior derecho del abdomen. Se ausculta peristalsis normal.",
  "physical_exploration_area_id": 1, // Puede o no ser necesario reenviar si no cambia
  "tenant_id": "tid_abcdef123456" // Puede o no ser necesario reenviar si no cambia
}
```

**Respuestas (Responses):**

- `201 Created` (Creado/Actualizado): Registro de exploración física creado o actualizado exitosamente.

  ```json
  {
    // Cuerpo de la respuesta del servidor tras la operación exitosa
    // Ejemplo:
    "id": "d1e2f3g4-h5i6-7890-1234-567890abcdef", // ID de la exploración física
    "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "physician_id": "b1c2d3e4-f5g6-7890-1234-567890abcdef",
    "medical_event_id": "c1d2e3f4-g5h6-7890-1234-567890abcdef",
    "description": "...",
    "physical_exploration_area_id": 1,
    "tenant_id": "tid_abcdef123456",
    "created_at": "2025-05-22T19:30:00.000Z",
    "updated_at": "2025-05-22T19:30:00.000Z"
  }
  ```

- `400 Bad Request` (Solicitud Incorrecta): Entrada inválida. El cuerpo de la solicitud no se ajusta al esquema esperado o contiene datos inválidos (e.g., campos faltantes, tipos incorrectos, UUIDs mal formados).

  ```json
  {
    "alert": "Se han detectado los siguientes errores en la petición: ",
    "errors": [
      {
        "property": "nombreDelCampo",
        "constraints": {
          "nombreDeLaRestriccion": "Mensaje de error detallado"
        }
      }
    ]
  }
  ```

- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `500 Internal Server Error` (Error Interno del Servidor): Ocurrió un error inesperado en el servidor (e.g., fallo al interactuar con la base de datos, violación de constraint no manejada explícitamente).

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Opcional, identificador para el tenant si no se provee en el cuerpo y es requerido por la lógica de negocio)

**Ejemplo de Uso (cURL para Crear):**

```bash
curl -X POST \
  http://localhost:3000/physical-explorations \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID_OPCIONAL' \
  -d '{
    "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "physician_id": "b1c2d3e4-f5g6-7890-1234-567890abcdef",
    "medical_event_id": "unique-event-id-for-creation",
    "description": "Exploración inicial sin hallazgos patológicos significativos.",
    "physical_exploration_area_id": 2,
    "tenant_id": "tid_example123"
  }'
```

## DTOs (Data Transfer Objects)

### `CreatePhysicalExplorationDto`

Define la estructura de datos para crear un nuevo registro de exploración física.

| Campo                          | Tipo             | Obligatorio | Descripción                                                                | Ejemplo                                     | Restricciones                      |
| ------------------------------ | ---------------- | ----------- | -------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| `patient_id`                   | string (UUID)    | Sí          | Identificador único del paciente.                                          | `"a1b2c3d4-e5f6-7890-1234-567890abcdef"`    | Debe ser un UUID válido.           |
| `physician_id`                 | string (UUID)    | Sí          | Identificador único del médico.                                            | `"b1c2d3e4-f5g6-7890-1234-567890abcdef"`    | Debe ser un UUID válido.           |
| `medical_event_id`             | string (UUID)    | Sí          | Identificador único del evento médico asociado.                            | `"c1d2e3f4-g5h6-7890-1234-567890abcdef"`    | Debe ser un UUID válido.           |
| `description`                  | string           | Sí          | Descripción detallada de los hallazgos de la exploración física.           | `"Paciente alerta, orientado, cooperador."` | Longitud entre 1 y 500 caracteres. |
| `physical_exploration_area_id` | number (integer) | Sí          | Identificador del área de exploración física (e.g., Abdomen, Tórax, etc.). | `1`                                         | Debe ser un entero, mínimo 1.      |
| `tenant_id`                    | string (UUID)    | Sí          | Identificador único del tenant.                                            | `"tid_abcdef123456"`                        | Debe ser un UUID válido.           |

### `UpdatePhysicalExplorationDto`

Define la estructura de datos para actualizar un registro de exploración física existente. Hereda parcialmente de `CreatePhysicalExplorationDto` y hace que todos los campos sean opcionales, excepto `medical_event_id` que se redefine como obligatorio para identificar el registro a actualizar.

| Campo                          | Tipo             | Obligatorio | Descripción                                                                                                  | Ejemplo                                           | Restricciones                        |
| ------------------------------ | ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------ |
| `patient_id`                   | string (UUID)    | No          | Identificador único del paciente (si se desea cambiar).                                                      | `"a1b2c3d4-e5f6-7890-1234-567890abcdef"`          | Debe ser un UUID válido.             |
| `physician_id`                 | string (UUID)    | No          | Identificador único del médico (si se desea cambiar).                                                        | `"b1c2d3e4-f5g6-7890-1234-567890abcdef"`          | Debe ser un UUID válido.             |
| `medical_event_id`             | string (UUID)    | **Sí**      | Identificador único del evento médico. **Clave para la actualización.**                                      | `"c1d2e3f4-g5h6-7890-1234-567890abcdef"`          | Debe ser un UUID válido y existente. |
| `description`                  | string           | No          | Descripción detallada de los hallazgos (si se desea cambiar).                                                | `"Actualización: Leve edema en tobillo derecho."` | Longitud entre 1 y 500 caracteres.   |
| `physical_exploration_area_id` | number (integer) | No          | Identificador del área de exploración física (si se desea cambiar).                                          | `3`                                               | Debe ser un entero, mínimo 1.        |
| `tenant_id`                    | string (UUID)    | No          | Identificador único del tenant (generalmente no se cambia, pero posible si la lógica de negocio lo permite). | `"tid_abcdef123456"`                              | Debe ser un UUID válido.             |

**Nota sobre la Actualización:** El controlador actual (`PhysicalExplorationController`) utiliza un único endpoint `POST /physical-explorations` que internamente, a través del servicio `PhysicalExplorationService`, maneja la lógica de creación o actualización. La distinción se basa en si el `medical_event_id` proporcionado ya existe en la base de datos asociado a una exploración física. Si bien Swagger muestra `CreatePhysicalExplorationDto` para el cuerpo de la solicitud, la lógica de actualización se activa con un `medical_event_id` existente.
