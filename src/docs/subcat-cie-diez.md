# Subcategorías CIE-10 Endpoints

## Descripción

El módulo de Subcategorías CIE-10 proporciona endpoints para gestionar las subcategorías de la Clasificación Internacional de Enfermedades, Décima Revisión (CIE-10). Estas subcategorías están asociadas a categorías principales del CIE-10 y permiten una clasificación más detallada de las enfermedades y problemas de salud. El módulo ofrece funcionalidades para crear, consultar, actualizar y eliminar (CRUD) subcategorías, así como para buscar subcategorías por palabra clave o filtrar por categoría principal.

## Endpoints

A continuación, se detallan los endpoints disponibles en el módulo de Subcategorías CIE-10:

### `POST /subcat-cie-diez`

Crea una nueva subcategoría CIE-10.

**Request Body:** `CreateSubcatCieDiezDto`

```json
{
  "code": "A01.0",
  "description": "Fiebre tifoidea",
  "categoryId": 1
}
```

**Responses:**

- `201 Created`: La subcategoría CIE-10 ha sido creada exitosamente.
- `400 Bad Request`: Solicitud inválida (ej. datos faltantes o incorrectos).

### `GET /subcat-cie-diez`

Obtiene todas las subcategorías CIE-10, con opción de paginación.

**Query Parameters:**

- `page` (number, opcional): Número de página para la paginación.
- `pageSize` (number, opcional): Número de ítems por página.
- `orderBy` (string, opcional): Campo por el cual ordenar los resultados (ej. "code", "description").
- `orderDirection` (string, opcional): Dirección de la ordenación ('asc' o 'desc').

**Responses:**

- `200 OK`: Subcategorías CIE-10 recuperadas exitosamente.
  Ejemplo de respuesta:
  ```json
  [
    {
      "id": 1,
      "code": "A01.0",
      "description": "Fiebre tifoidea",
      "categoryId": 1
    },
    {
      "id": 2,
      "code": "A01.1",
      "description": "Paratifoidea A",
      "categoryId": 1
    }
    // ... más subcategorías
  ]
  ```

### `GET /subcat-cie-diez/search`

Busca subcategorías CIE-10 por palabra clave.

**Query Parameters:**

- `searchWord` (string, required): Palabra clave para buscar subcategorías CIE-10.

**Responses:**

- `200 OK`: Subcategorías CIE-10 encontradas.
  Ejemplo de respuesta:
  ```json
  [
    {
      "id": 1,
      "code": "A01.0",
      "description": "Fiebre tifoidea",
      "categoryId": 1
    }
    // ... más subcategorías que coinciden con la búsqueda
  ]
  ```

### `GET /subcat-cie-diez/category/{id}`

Obtiene todas las subcategorías asociadas a una categoría CIE-10 específica.

**Path Parameters:**

- `id` (number, required): ID de la categoría CIE-10.

**Query Parameters:**

- `page` (number, opcional): Número de página para la paginación.
- `pageSize` (number, opcional): Número de ítems por página.
- `orderBy` (string, opcional): Campo por el cual ordenar los resultados.
- `orderDirection` (string, opcional): Dirección de la ordenación ('asc' o 'desc').

**Responses:**

- `200 OK`: Subcategorías CIE-10 de la categoría especificada recuperadas exitosamente.
  Ejemplo de respuesta:
  ```json
  [
    {
      "id": 1,
      "code": "A01.0",
      "description": "Fiebre tifoidea",
      "categoryId": 1
    },
    {
      "id": 2,
      "code": "A01.1",
      "description": "Paratifoidea A",
      "categoryId": 1
    }
    // ... más subcategorías de la categoría especificada
  ]
  ```

### `GET /subcat-cie-diez/{id}`

Obtiene una subcategoría específica CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la subcategoría CIE-10.

**Responses:**

- `200 OK`: Subcategoría CIE-10 recuperada exitosamente.
  Ejemplo de respuesta:
  ```json
  {
    "id": 1,
    "code": "A01.0",
    "description": "Fiebre tifoidea",
    "categoryId": 1
  }
  ```
- `404 Not Found`: La subcategoría CIE-10 con el ID especificado no fue encontrada.

### `PATCH /subcat-cie-diez/{id}`

Actualiza una subcategoría existente de CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la subcategoría CIE-10 a actualizar.

**Request Body:** `UpdateSubcatCieDiezDto` (parcial de `CreateSubcatCieDiezDto`)

```json
{
  "description": "Fiebre tifoidea aguda"
}
```

**Responses:**

- `200 OK`: La subcategoría CIE-10 ha sido actualizada exitosamente.
- `404 Not Found`: La subcategoría CIE-10 con el ID especificado no fue encontrada.
- `400 Bad Request`: Solicitud inválida.

### `DELETE /subcat-cie-diez/{id}`

Elimina una subcategoría de CIE-10 por su ID.

**Path Parameters:**

- `id` (number, required): ID de la subcategoría CIE-10 a eliminar.

**Responses:**

- `200 OK`: La subcategoría CIE-10 ha sido eliminada exitosamente.
- `404 Not Found`: La subcategoría CIE-10 con el ID especificado no fue encontrada.
