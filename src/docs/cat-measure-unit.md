# Catálogo de Unidades de Medida Endpoints

## Descripción

El módulo del Catálogo de Unidades de Medida gestiona las unidades utilizadas para los signos vitales en la plataforma. Permite crear, leer y eliminar unidades de medida. Todos los endpoints de este módulo requieren el header `tenant_id`.

## Endpoints

A continuación, se detallan los endpoints disponibles:

### `POST /cat-measure-unit`

Crea una nueva unidad de medida. Este endpoint requiere permisos de Super Administrador y `MANAGE_CATALOGS`.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Request Body:** `CreateCatMeasureUnitDto`

```json
{
  "name": "mmHg",
  "description": "Milímetros de mercurio",
  "cat_vital_signs_id": 1
}
```

**Responses:**

- `201 Created`: La unidad de medida ha sido creada exitosamente.
- `400 Bad Request`: Solicitud inválida (ej. datos faltantes o incorrectos).
- `403 Forbidden`: Acceso denegado (no es Super Administrador o no tiene el permiso `MANAGE_CATALOGS`).

### `GET /cat-measure-unit`

Obtiene todas las unidades de medida. Opcionalmente, puede filtrarlas por el ID de un signo vital específico.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Query Parameters:**

- `vitalSignId` (number, opcional): ID del signo vital para filtrar las unidades de medida.

**Responses:**

- `200 OK`: Unidades de medida recuperadas exitosamente.
  Ejemplo de respuesta (sin filtro):
  ```json
  [
    {
      "id": 1,
      "name": "mmHg",
      "description": "Milímetros de mercurio",
      "cat_vital_signs_id": 1
    },
    {
      "id": 2,
      "name": "lat/min",
      "description": "Latidos por minuto",
      "cat_vital_signs_id": 2
    }
    // ... más unidades
  ]
  ```
  Ejemplo de respuesta (filtrado por `vitalSignId=1`):
  ```json
  [
    {
      "id": 1,
      "name": "mmHg",
      "description": "Milímetros de mercurio",
      "cat_vital_signs_id": 1
    }
  ]
  ```
- `400 Bad Request`: Solicitud inválida (ej. `vitalSignId` no es un número).
- `403 Forbidden`: Acceso denegado.

### `DELETE /cat-measure-unit/{id}`

Elimina una unidad de medida por su ID. Este endpoint requiere permisos de Super Administrador y `MANAGE_CATALOGS`.

**Headers:**

- `tenant_id` (string, required): ID del tenant.

**Path Parameters:**

- `id` (number, required): ID de la unidad de medida a eliminar.

**Responses:**

- `200 OK`: La unidad de medida ha sido eliminada exitosamente.
- `403 Forbidden`: Acceso denegado (no es Super Administrador o no tiene el permiso `MANAGE_CATALOGS`).
- `404 Not Found`: La unidad de medida con el ID especificado no fue encontrada.
