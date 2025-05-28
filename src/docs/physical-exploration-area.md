# Módulo de Áreas de Exploración Física

## Descripción General

El módulo de Áreas de Exploración Física es responsable de gestionar el catálogo de las diferentes áreas corporales que pueden ser objeto de una exploración física (e.g., "Abdomen", "Tórax", "Extremidades Superiores", "Cabeza y Cuello"). Estos registros sirven como una lista predefinida o una biblioteca de términos para asegurar la consistencia en los registros de exploración física.

Este módulo permite la creación de nuevas áreas de exploración. Actualmente, no expone endpoints para la modificación, consulta individual o eliminación de estas áreas a través de la API, asumiendo que estas operaciones podrían ser manejadas directamente en la base de datos o a través de herramientas administrativas si fuera necesario.

## Endpoints

### `POST /physical-exploration-areas`

Crea una nueva área de exploración física en el sistema.

**Cuerpo de la Solicitud (Request Body):**

El cuerpo de la solicitud debe ser un objeto JSON que se ajuste al `CreatePhysicalExplorationAreaDto`.

```json
{
  "name_on_library": "string (max 100 caracteres, identificador único en la biblioteca)",
  "name": "string (max 100 caracteres, nombre descriptivo)"
}
```

**Ejemplo de Creación:**

```json
{
  "name_on_library": "ABDOMEN_CSD",
  "name": "Abdomen - Cuadrante Superior Derecho"
}
```

**Respuestas (Responses):**

- `201 Created` (Creado): El área de exploración física ha sido creada exitosamente.

  ```json
  {
    // Cuerpo de la respuesta del servidor tras la creación exitosa
    // Ejemplo:
    "id": 123, // ID numérico del área creada
    "name_on_library": "ABDOMEN_CSD",
    "name": "Abdomen - Cuadrante Superior Derecho",
    "created_at": "2025-05-22T20:00:00.000Z",
    "updated_at": "2025-05-22T20:00:00.000Z"
  }
  ```

- `400 Bad Request` (Solicitud Incorrecta): Entrada inválida. El cuerpo de la solicitud no se ajusta al esquema esperado (e.g., campos faltantes, tipos incorrectos, longitud excedida).

  ```json
  {
    "alert": "Se han detectado los siguientes errores en la petición: ",
    "errors": [
      {
        "property": "name_on_library",
        "constraints": {
          "isNotEmpty": "name_on_library should not be empty",
          "isString": "name_on_library must be a string",
          "maxLength": "name_on_library must be shorter than or equal to 100 characters"
        }
      }
      // ... otros errores posibles
    ]
  }
  ```

- `401 Unauthorized` (No Autorizado): El token de autenticación falta o es inválido.
- `409 Conflict` (Conflicto): Ya existe un área de exploración física con el mismo `name_on_library` o `name` (dependiendo de las constraints de la base de datos y la lógica del servicio).
  ```json
  {
    "message": "Conflict - An area with the same name or library name already exists.",
    "error": "Detalle del error original si aplica"
  }
  ```
- `500 Internal Server Error` (Error Interno del Servidor): Ocurrió un error inesperado en el servidor.

**Encabezados (Headers):**

- `Authorization`: Bearer `token-de-acceso` (Token JWT para autenticación)
- `X-Tenant-ID`: `string` (Opcional, identificador para el tenant si la gestión de estas áreas es específica por tenant. Ajustar según la lógica de negocio.)

**Ejemplo de Uso (cURL):**

```bash
curl -X POST \
  http://localhost:3000/physical-exploration-areas \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_DE_ACCESO' \
  -d '{
    "name_on_library": "EXT_INF_IZQ",
    "name": "Extremidad Inferior Izquierda"
  }'
```

## DTOs (Data Transfer Objects)

### `CreatePhysicalExplorationAreaDto`

Define la estructura de datos para crear una nueva área de exploración física.

| Campo             | Tipo   | Obligatorio | Descripción                                                                                | Ejemplo                                  | Restricciones                      |
| ----------------- | ------ | ----------- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------- |
| `name_on_library` | string | Sí          | Identificador único para el área en la biblioteca interna (e.g., un código o abreviatura). | `"ABDOMEN_CSD"`                          | Longitud entre 1 y 100 caracteres. |
| `name`            | string | Sí          | Nombre descriptivo y legible por humanos para el área de exploración física.               | `"Abdomen - Cuadrante Superior Derecho"` | Longitud entre 1 y 100 caracteres. |
