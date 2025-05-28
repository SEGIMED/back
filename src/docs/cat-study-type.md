# Catálogo de Tipos de Estudio Endpoints

## Descripción

El módulo del Catálogo de Tipos de Estudio gestiona los diferentes tipos de estudios médicos que se pueden registrar en la plataforma (ej. "Análisis de Sangre", "Radiografía", etc.). Permite crear, leer, actualizar y eliminar estos tipos de estudio.

## Endpoints

A continuación, se detallan los endpoints disponibles:

### `POST /cat-study-type`

Crea un nuevo tipo de estudio.

**Request Body:** `CreateCatStudyTypeDto`

```json
{
  "name": "Análisis de Sangre"
}
```

**Responses:**

- `201 Created`: El tipo de estudio ha sido creado exitosamente.
  Respuesta Ejemplo:
  ```json
  {
    "id": 1,
    "name": "Análisis de Sangre"
  }
  ```
- `400 Bad Request`: Solicitud inválida (ej. el campo `name` está vacío).

### `GET /cat-study-type`

Obtiene todos los tipos de estudio registrados.

**Responses:**

- `200 OK`: Tipos de estudio recuperados exitosamente.
  Respuesta Ejemplo:
  ```json
  [
    {
      "id": 1,
      "name": "Análisis de Sangre"
    },
    {
      "id": 2,
      "name": "Radiografía de Tórax"
    }
    // ... más tipos de estudio
  ]
  ```

### `GET /cat-study-type/{id}`

Obtiene un tipo de estudio específico por su ID.

**Path Parameters:**

- `id` (number, required): ID del tipo de estudio.

**Responses:**

- `200 OK`: Tipo de estudio recuperado exitosamente.
  Respuesta Ejemplo:
  ```json
  {
    "id": 1,
    "name": "Análisis de Sangre"
  }
  ```
- `404 Not Found`: El tipo de estudio con el ID especificado no fue encontrado.

### `PUT /cat-study-type/{id}`

Actualiza un tipo de estudio existente por su ID. Requiere que se envíe el objeto completo del tipo de estudio.

**Path Parameters:**

- `id` (number, required): ID del tipo de estudio a actualizar.

**Request Body:** `CreateCatStudyTypeDto` (se envía el objeto completo)

```json
{
  "name": "Análisis de Sangre Completo"
}
```

**Responses:**

- `200 OK`: El tipo de estudio ha sido actualizado exitosamente.
  Respuesta Ejemplo:
  ```json
  {
    "id": 1,
    "name": "Análisis de Sangre Completo"
  }
  ```
- `404 Not Found`: El tipo de estudio con el ID especificado no fue encontrado.
- `400 Bad Request`: Solicitud inválida.

### `DELETE /cat-study-type/{id}`

Elimina un tipo de estudio por su ID.

**Path Parameters:**

- `id` (number, required): ID del tipo de estudio a eliminar.

**Responses:**

- `200 OK`: El tipo de estudio ha sido eliminado exitosamente.
  Respuesta Ejemplo (puede variar, podría ser el objeto eliminado o un mensaje de éxito):
  ```json
  {
    "id": 1,
    "name": "Análisis de Sangre Completo"
  }
  ```
- `404 Not Found`: El tipo de estudio con el ID especificado no fue encontrado.
