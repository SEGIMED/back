# Historial de Modificaciones de Prescripciones - API Endpoints

## Descripción

El módulo de Historial de Modificaciones de Prescripciones (Prescription Modification History) permite registrar y consultar todos los cambios realizados a las prescripciones médicas a lo largo del tiempo. Este historial es esencial para el seguimiento de los tratamientos, la auditoría médica y para garantizar la trazabilidad de las modificaciones realizadas por los médicos a las prescripciones de medicamentos.

## Endpoints

### `POST /pres-mod-history`

Crea un registro de modificación de prescripción.

#### Headers Requeridos

| Header        | Descripción                                            | Requerido |
| ------------- | ------------------------------------------------------ | --------- |
| tenant_id     | ID del inquilino (tenant) al que pertenece el usuario  | Sí        |
| Authorization | Token JWT en formato Bearer para autenticar al usuario | Sí        |

#### Request Body: `CreatePresHistoryDto`

```json
{
  "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
  "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
  "mod_timestamp": "2025-05-22T14:30:00.000Z",
  "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
  "observations": "Se ajustó la dosis debido a efectos secundarios",
  "dose": "500",
  "dose_units": "mg",
  "frecuency": "Cada 8 horas",
  "duration": "7",
  "duration_units": "días",
  "monodrug": "Paracetamol"
}
```

#### Elementos del Request Body

| Campo            | Tipo   | Descripción                                | Requerido |
| ---------------- | ------ | ------------------------------------------ | --------- |
| prescription_id  | String | ID de la prescripción modificada           | Sí        |
| physician_id     | String | ID del médico que realizó la modificación  | Sí        |
| mod_timestamp    | Date   | Fecha y hora de la modificación            | Sí        |
| medical_event_id | String | ID del evento médico asociado              | No        |
| observations     | String | Observaciones sobre la modificación        | No        |
| dose             | String | Dosis del medicamento                      | Sí        |
| dose_units       | String | Unidades de la dosis (mg, ml, etc.)        | Sí        |
| frecuency        | String | Frecuencia de administración               | Sí        |
| duration         | String | Duración del tratamiento                   | Sí        |
| duration_units   | String | Unidades de duración (días, semanas, etc.) | Sí        |
| monodrug         | String | Monofármaco prescrito                      | No        |

#### Responses

- `201 Created`: La historia de modificación ha sido creada exitosamente.

  ```json
  {
    "message": "La historia ha sido creada"
  }
  ```

- `400 Bad Request`: Solicitud inválida (datos faltantes o incorrectos).
  ```json
  {
    "message": "No se ha podido generar la historia [detalles del error]"
  }
  ```

### `GET /pres-mod-history/prescription/{id}`

Obtiene el historial de modificaciones por ID de prescripción.

#### Path Parameters

- `id` (string, required): ID de la prescripción.

#### Responses

- `200 OK`: Historial de modificaciones recuperado exitosamente.

  ```json
  [
    {
      "id": 1,
      "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-22T14:30:00.000Z",
      "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
      "observations": "Se ajustó la dosis debido a efectos secundarios",
      "dose": "500",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días"
    },
    {
      "id": 2,
      "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-25T09:15:00.000Z",
      "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
      "observations": "Se aumentó la dosis por respuesta insuficiente",
      "dose": "750",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días"
    }
  ]
  ```

- `404 Not Found`: Prescripción no encontrada.
  ```json
  {
    "message": "No se ha podido consultar por prescripción [detalles del error]"
  }
  ```

### `GET /pres-mod-history/physician/{id}`

Obtiene el historial de modificaciones por ID de médico.

#### Path Parameters

- `id` (string, required): ID del médico.

#### Responses

- `200 OK`: Historial de modificaciones recuperado exitosamente.

  ```json
  [
    {
      "id": 1,
      "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-22T14:30:00.000Z",
      "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
      "observations": "Se ajustó la dosis debido a efectos secundarios",
      "dose": "500",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días"
    },
    {
      "id": 3,
      "prescription_id": "11223344-5566-7788-99aa-bbccddeeff00",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-20T16:45:00.000Z",
      "medical_event_id": "aabbccdd-eeff-0011-2233-445566778899",
      "observations": "Cambio de medicamento por alergia",
      "dose": "20",
      "dose_units": "mg",
      "frecuency": "Cada 12 horas",
      "duration": "10",
      "duration_units": "días"
    }
  ]
  ```

- `404 Not Found`: Médico no encontrado.
  ```json
  {
    "message": "No se ha podido consultar por médico [detalles del error]"
  }
  ```

### `GET /pres-mod-history/medical_event/{id}`

Obtiene el historial de modificaciones por ID de evento médico.

#### Path Parameters

- `id` (string, required): ID del evento médico.

#### Responses

- `200 OK`: Historial de modificaciones recuperado exitosamente.

  ```json
  [
    {
      "id": 1,
      "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-22T14:30:00.000Z",
      "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
      "observations": "Se ajustó la dosis debido a efectos secundarios",
      "dose": "500",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días"
    },
    {
      "id": 2,
      "prescription_id": "abcdef01-2345-6789-abcd-ef0123456789",
      "physician_id": "fedcba98-7654-3210-fedc-ba9876543210",
      "mod_timestamp": "2025-05-25T09:15:00.000Z",
      "medical_event_id": "456abcde-f789-0123-4567-89abcdef0123",
      "observations": "Se aumentó la dosis por respuesta insuficiente",
      "dose": "750",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días"
    }
  ]
  ```

- `404 Not Found`: Evento médico no encontrado.
  ```json
  {
    "message": "No se ha podido consultar por evento médico [detalles del error]"
  }
  ```

## Uso práctico

Este módulo se utiliza para:

1. **Registrar cambios en prescripciones**: Cuando un médico modifica la dosis, frecuencia, duración u otro aspecto de una prescripción, se registra automáticamente en el historial.

2. **Auditoría médica**: Permite a los supervisores médicos revisar los cambios realizados en los tratamientos de los pacientes.

3. **Seguimiento de tratamientos**: Facilita a los médicos ver la evolución de las prescripciones a lo largo del tiempo para un paciente.

4. **Resolución de controversias**: Proporciona un registro detallado y con marca de tiempo para verificar qué cambios se hicieron, cuándo y por quién.

## Consideraciones de seguridad

- Se requiere autenticación mediante token JWT para acceder a estos endpoints.
- Se requiere el header `tenant_id` para identificar el contexto organizacional.
- El acceso a este módulo debe estar restringido a personal médico autorizado y administradores del sistema.
- La información de las prescripciones y sus modificaciones es sensible y debe tratarse de acuerdo con las regulaciones de privacidad médica aplicables.
