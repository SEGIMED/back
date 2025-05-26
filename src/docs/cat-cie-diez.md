# Catálogo CIE-10 Endpoints

## Descripción

El módulo del Catálogo CIE-10 (Clasificación Internacional de Enfermedades, Décima Revisión) proporciona endpoints para gestionar las categorías de enfermedades y problemas de salud relacionados. Permite crear, leer, actualizar y eliminar (CRUD) entradas del catálogo CIE-10.

## Endpoints

A continuación, se detallan los endpoints disponibles en el módulo del Catálogo CIE-10:

### `POST /cat-cie-diez`

Crea una nueva categoría en el catálogo CIE-10.

**Request Body:** `CreateCatCieDiezDto`

```json
{
  "code": "A001",
  "description": "Fiebres tifoidea y paratifoidea"
}
```

**Responses:**

- `201 Created`: La categoría CIE-10 ha sido creada exitosamente.
- `400 Bad Request`: Solicitud inválida (ej. datos faltantes o incorrectos).

### `GET /cat-cie-diez`

Obtiene todas las categorías del catálogo CIE-10, con opción de paginación.

**Query Parameters:**

- `page` (number, opcional): Número de página para la paginación.
- `pageSize` (number, opcional): Número de ítems por página.
- `orderBy` (string, opcional): Campo por el cual ordenar los resultados (ej. "code", "description").
- `orderDirection` (string, opcional): Dirección de la ordenación ('asc' o 'desc').

**Responses:**

- `200 OK`: Categorías CIE-10 recuperadas exitosamente.
  Ejemplo de respuesta:
  ```json
  [
    {
      "id": 1,
      "code": "A001",
      "description": "Fiebres tifoidea y paratifoidea"
    },
    {
      "id": 2,
      "code": "A002",
      "description": "Cólera"
    }
    // ... más categorías
  ]
  ```

### `GET /cat-cie-diez/{id}`

Obtiene una categoría específica del catálogo CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la categoría CIE-10.

**Responses:**

- `200 OK`: Categoría CIE-10 recuperada exitosamente.
  Ejemplo de respuesta:
  ```json
  {
    "id": 1,
    "code": "A001",
    "description": "Fiebres tifoidea y paratifoidea"
  }
  ```
- `404 Not Found`: La categoría CIE-10 con el ID especificado no fue encontrada.

### `PATCH /cat-cie-diez/{id}`

Actualiza una categoría existente en el catálogo CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la categoría CIE-10 a actualizar.

**Request Body:** `UpdateCatCieDiezDto` (parcial de `CreateCatCieDiezDto`)

```json
{
  "description": "Fiebres tifoidea, paratifoidea y otras salmonelosis"
}
```

**Responses:**

- `200 OK`: La categoría CIE-10 ha sido actualizada exitosamente.
- `404 Not Found`: La categoría CIE-10 con el ID especificado no fue encontrada.
- `400 Bad Request`: Solicitud inválida.

### `DELETE /cat-cie-diez/{id}`

Elimina una categoría del catálogo CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la categoría CIE-10 a eliminar.

**Responses:**

- `200 OK`: La categoría CIE-10 ha sido eliminada exitosamente.
- `404 Not Found`: La categoría CIE-10 con el ID especificado no fue encontrada.
