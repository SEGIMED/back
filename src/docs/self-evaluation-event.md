# Eventos de Autoevaluación (Self-Evaluation Events) - API Endpoints

## Descripción

El módulo de Eventos de Autoevaluación permite a los pacientes registrar sus signos vitales desde la aplicación móvil. Estos eventos están asociados a un evento médico específico y al paciente que realiza la autoevaluación. La información recolectada puede ser monitoreada por el personal médico para dar seguimiento a la condición del paciente entre consultas.

## Endpoints

### `POST /mobile/self-evaluation-event`

Crea un nuevo evento de autoevaluación con los signos vitales registrados por el paciente.

#### Headers Requeridos

| Header        | Descripción                                            | Requerido |
| ------------- | ------------------------------------------------------ | --------- |
| tenant_id     | ID del inquilino (tenant) al que pertenece el usuario  | Sí        |
| Authorization | Token JWT en formato Bearer para autenticar al usuario | Sí        |

#### Permisos requeridos

- `VIEW_PATIENT_DETAILS`: Permiso necesario para crear eventos de autoevaluación.
- El usuario debe ser el mismo paciente, un administrador o un médico con permisos.

#### Request Body: `CreateSelfEvaluationEventDto`

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "medical_event_id": "abcdef01-2345-6789-abcd-ef0123456789",
  "tenant_id": "tid_12345-6789-abcd-ef0123456789",
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

#### Elementos del Request Body

| Campo                       | Tipo   | Descripción                                                           | Requerido |
| --------------------------- | ------ | --------------------------------------------------------------------- | --------- |
| patient_id                  | UUID   | ID del paciente que realiza la autoevaluación                         | Sí        |
| medical_event_id            | UUID   | ID del evento médico asociado a esta autoevaluación                   | Sí        |
| tenant_id                   | UUID   | ID del inquilino (tenant) en el sistema                               | Sí        |
| vital_signs                 | Array  | Lista de signos vitales registrados                                   | Sí        |
| vital_signs[].vital_sign_id | Number | ID del tipo de signo vital (referencia al catálogo de signos vitales) | Sí        |
| vital_signs[].measure       | Number | Valor medido del signo vital                                          | Sí        |

#### Responses

- `201 Created`: El evento de autoevaluación ha sido creado exitosamente.

  Ejemplo de respuesta:

  ```json
  {
    "id": "fedcba98-7654-3210-fedc-ba9876543210",
    "patient_id": "123e4567-e89b-12d3-a456-426614174000",
    "medical_event_id": "abcdef01-2345-6789-abcd-ef0123456789",
    "tenant_id": "tid_12345-6789-abcd-ef0123456789",
    "created_at": "2025-05-22T10:30:00.000Z",
    "vital_signs": [
      {
        "id": 101,
        "vital_sign_id": 1,
        "measure": 98.6,
        "self_evaluation_event_id": "fedcba98-7654-3210-fedc-ba9876543210"
      },
      {
        "id": 102,
        "vital_sign_id": 2,
        "measure": 120,
        "self_evaluation_event_id": "fedcba98-7654-3210-fedc-ba9876543210"
      }
    ]
  }
  ```

- `400 Bad Request`: Solicitud inválida.

  - El tenant_id en el DTO no coincide con el tenant del request.
  - El patient_id en el DTO no coincide con el usuario autenticado y no tiene permisos suficientes.
  - Datos faltantes o incorrectos.

  Ejemplo de respuesta:

  ```json
  {
    "alert": "Se han detectado los siguientes errores en la petición: ",
    "errors": [
      {
        "property": "vital_signs",
        "constraints": {
          "arrayNotEmpty": "Debe proporcionar al menos un signo vital"
        }
      }
    ]
  }
  ```

- `403 Forbidden`: No tiene permisos para crear eventos de autoevaluación.

## Consideraciones de Seguridad

- Se requiere un header `tenant_id` válido que coincida con el tenant_id proporcionado en el cuerpo de la solicitud.
- Se verifica que el tenant_id en el DTO coincida con el tenant del request.
- Se verifica que el patient_id en el DTO coincida con el usuario autenticado o que el usuario tenga permisos suficientes (superadmin o médico).
- Se requiere el permiso `VIEW_PATIENT_DETAILS` para crear eventos de autoevaluación.

## Uso Común

Este endpoint se utiliza principalmente desde la aplicación móvil, donde los pacientes pueden:

1. Registrar sus signos vitales periódicamente según las indicaciones médicas.
2. Enviar estos datos asociados a un evento médico específico (como una consulta o tratamiento).
3. Permitir que el personal médico monitoree su progreso entre consultas.

## Integración con Otros Módulos

- **Módulo de Eventos Médicos**: Los eventos de autoevaluación están asociados a eventos médicos específicos.
- **Módulo de Signos Vitales**: Utiliza el catálogo de signos vitales para identificar los tipos de mediciones que se registran.
- **Módulo de Pacientes**: Verifica la identidad del paciente que realiza la autoevaluación.
