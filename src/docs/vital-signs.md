# Módulo de Signos Vitales

## Descripción General

El módulo de Signos Vitales es responsable de gestionar el registro y consulta de los signos vitales de los pacientes. Los signos vitales son mediciones fisiológicas que indican el estado de salud básico de una persona, como la temperatura corporal, el ritmo cardíaco, la presión arterial, entre otros.

Este módulo permite la creación, consulta y eliminación de registros de signos vitales, ya sea como parte de una consulta médica o a través de la autoevaluación del paciente.

## Endpoints

### `POST /vital-signs`

Crea un nuevo registro de signos vitales para un paciente.

**Cuerpo de la Solicitud (Request Body):**

El cuerpo de la solicitud debe ser un objeto JSON que se ajuste al `CreateVitalSignDto`.

```json
{
  "patient_id": "string (UUID)",
  "tenant_id": "string (UUID, opcional)",
  "medical_event_id": "string (UUID, opcional)",
  "self_evaluation_event_id": "string (UUID, opcional)",
  "vital_signs": [
    {
      "vital_sign_id": 1,
      "measure": 98.6
    },
    {
      "vital_sign_id": 2,
      "measure": 120
    }
  ]
}
```

**Respuestas (Responses):**

- `201 Created` (Creado): Registro de signos vitales creado exitosamente.
  ```json
  {
    // Cuerpo de la respuesta del servidor tras la creación exitosa
  }
  ```

- `400 Bad Request` (Solicitud Incorrecta): Entrada inválida. El cuerpo de la solicitud no se ajusta al esquema esperado o contiene datos inválidos.
  ```json
  {
    "alert": "Se han detectado los siguientes errores en la petición: ",
    "errors": [
      {
        "property": "nombreDelCampo",
        "constraints": {
          "nombreDeLaRestriccion": "Mensaje de error"
        }
      }
    ]
  }
  ```

- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `403 Forbidden` (Prohibido): El usuario no tiene los permisos necesarios para realizar esta acción.
- `500 Internal Server Error` (Error Interno del Servidor): Ocurrió un error inesperado en el servidor.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Identificador para el tenant)

**Ejemplo de Uso (cURL):**

```bash
curl -X POST \
  http://localhost:3000/vital-signs \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID' \
  -d '{
    "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "vital_signs": [
      {
        "vital_sign_id": 1,
        "measure": 37.5
      },
      {
        "vital_sign_id": 2,
        "measure": 120
      },
      {
        "vital_sign_id": 3,
        "measure": 80
      },
      {
        "vital_sign_id": 4,
        "measure": 20
      }
    ]
  }'
```

### `GET /vital-signs/patient/:patientId`

Obtiene todos los registros de signos vitales para un paciente específico.

**Parámetros de Ruta (Path Parameters):**

- `patientId`: UUID del paciente cuyos signos vitales se desean consultar.

**Respuestas (Responses):**

- `200 OK`: Devuelve un array con los registros de signos vitales del paciente.
  ```json
  [
    {
      "id": "string (UUID)",
      "created_at": "string (fecha ISO)",
      "patient_id": "string (UUID)",
      "vital_signs": [
        {
          "id": "string (UUID)",
          "vital_sign_id": 1,
          "measure": 37.5,
          "name": "Temperatura",
          "unit": "°C"
        },
        // Más signos vitales...
      ]
    }
    // Más registros de signos vitales...
  ]
  ```

- `400 Bad Request` (Solicitud Incorrecta): ID de paciente inválido.
- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `403 Forbidden` (Prohibido): El usuario no tiene los permisos necesarios para realizar esta acción.
- `404 Not Found` (No Encontrado): No se encontró el paciente especificado.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Identificador para el tenant)

**Ejemplo de Uso (cURL):**

```bash
curl -X GET \
  http://localhost:3000/vital-signs/patient/a1b2c3d4-e5f6-7890-1234-567890abcdef \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID'
```

### `DELETE /vital-signs/:id`

Elimina un registro de signos vitales específico.

**Parámetros de Ruta (Path Parameters):**

- `id`: UUID del registro de signos vitales a eliminar.

**Respuestas (Responses):**

- `200 OK`: Registro de signos vitales eliminado exitosamente.
  ```json
  {
    // Confirmación de eliminación
  }
  ```

- `400 Bad Request` (Solicitud Incorrecta): ID de registro inválido.
- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `403 Forbidden` (Prohibido): El usuario no tiene los permisos necesarios para realizar esta acción.
- `404 Not Found` (No Encontrado): No se encontró el registro de signos vitales especificado.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Identificador para el tenant)

**Ejemplo de Uso (cURL):**

```bash
curl -X DELETE \
  http://localhost:3000/vital-signs/a1b2c3d4-e5f6-7890-1234-567890abcdef \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID'
```

## Tipos de Signos Vitales

Los tipos de signos vitales comunes incluyen:

| vital_sign_id | Nombre | Unidad de Medida | Rango Normal Adultos |
|---------------|--------|------------------|----------------------|
| 1 | Temperatura | °C | 36.1 - 37.2 |
| 2 | Presión Arterial Sistólica | mmHg | 90 - 120 |
| 3 | Presión Arterial Diastólica | mmHg | 60 - 80 |
| 4 | Frecuencia Respiratoria | resp/min | 12 - 20 |
| 5 | Frecuencia Cardíaca | lat/min | 60 - 100 |
| 6 | Saturación de Oxígeno | % | 95 - 100 |
| 7 | Glucemia | mg/dL | 70 - 100 (en ayunas) |

**Nota**: Los rangos normales pueden variar según la edad, sexo y condiciones médicas particulares del paciente.
