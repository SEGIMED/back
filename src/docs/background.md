# Módulo de Antecedentes

## Descripción General

El módulo de Antecedentes es responsable de gestionar la información médica de antecedentes del paciente. Esto incluye varios aspectos del historial médico de un paciente, como alergias, vacunas, enfermedades pasadas, cirugías, antecedentes médicos familiares y medicamentos actuales.

Esta información es crucial para proporcionar una atención médica integral e informada.

## Endpoints

### `POST /background`

Crea un nuevo registro de antecedentes para un paciente.

**Cuerpo de la Solicitud (Request Body):**

El cuerpo de la solicitud debe ser un objeto JSON que se ajuste al `CreateBackgroundDto`.

```json
{
  "patient_id": "string (UUID)",
  "vaccinations": "string",
  "allergies": "string",
  "pathological_history": "string",
  "family_medical_history": "string",
  "non_pathological_history": "string",
  "surgical_history": "string",
  "childhood_medical_history": "string",
  "current_medication": "string",
  "tenant_id": "string"
}
```

**Respuestas (Responses):**

*   `201 Created` (Creado): Registro de antecedentes creado exitosamente.
    ```json
    {
      // Cuerpo de la respuesta del servidor tras la creación exitosa
    }
    ```
*   `400 Bad Request` (Solicitud Incorrecta): Entrada inválida. El cuerpo de la solicitud no se ajusta al esquema esperado o contiene datos inválidos.
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
*   `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
*   `500 Internal Server Error` (Error Interno del Servidor): Ocurrió un error inesperado en el servidor.
    ```json
    {
      "message": "Error al crear antecedentes",
      "error": "Mensaje de error específico"
    }
    ```

**Encabezados (Headers):**

*   `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
*   `X-Tenant-ID`: `string` (Identificador para el tenant)

**Ejemplo de Uso (cURL):**

```bash
curl -X POST \
  http://localhost:3000/background \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -H 'X-Tenant-ID: TU_TENANT_ID' \
  -d '{
    "patient_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "vaccinations": "Influenza (2023), Tétanos (2020)",
    "allergies": "Polen, Ácaros del polvo",
    "pathological_history": "Asma diagnosticada en la infancia.",
    "family_medical_history": "Madre con hipertensión.",
    "non_pathological_history": "No fumador, alcohol ocasional.",
    "surgical_history": "Amigdalectomía (1995)",
    "childhood_medical_history": "Varicela (1990)",
    "current_medication": "Inhalador de Albuterol según sea necesario.",
    "tenant_id": "tenant_organizacion_xyz"
  }'
```
