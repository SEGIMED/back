# API de Catálogo de Tipos de Orden

Este módulo proporciona endpoints para gestionar el catálogo de Tipos de Orden en la plataforma SEGIMED. Los tipos de orden se utilizan para categorizar los diferentes tipos de órdenes médicas.

## Requisitos de Seguridad

- **Autenticación con Token Bearer**: Todos los endpoints requieren un token JWT válido en el header de Authorization.
- **ID de Tenant**: Todas las peticiones deben incluir el header `tenant_id`.

## Endpoints

### Crear un Tipo de Orden

```http
POST /order-type
```

Crea un nuevo tipo de orden en el catálogo.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |
| tenant_id     | Sí        | ID del tenant         |

#### Cuerpo de la Petición

```json
{
  "id": "lab-test",
  "name": "Prueba de Laboratorio",
  "description": "Orden médica para pruebas de laboratorio"
}
```

| Campo       | Tipo   | Requerido | Descripción                    |
| ----------- | ------ | --------- | ------------------------------ |
| id          | string | No        | ID único para el tipo de orden |
| name        | string | Sí        | Nombre del tipo de orden       |
| description | string | No        | Descripción del tipo de orden  |

#### Respuesta

**Código de Estado**: 201 Created

```json
{
  "id": "lab-test",
  "name": "Prueba de Laboratorio",
  "description": "Orden médica para pruebas de laboratorio"
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Detalles de la solicitud incorrecta",
  "error": "Bad Request"
}
```

### Obtener Todos los Tipos de Orden

```http
GET /order-type
```

Recupera una lista paginada de todos los tipos de orden.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |
| tenant_id     | Sí        | ID del tenant         |

#### Parámetros de Consulta

| Parámetro      | Requerido | Descripción                                         |
| -------------- | --------- | --------------------------------------------------- |
| page           | No        | Número de página a recuperar (predeterminado: 1)    |
| pageSize       | No        | Número de elementos por página (predeterminado: 10) |
| orderBy        | No        | Campo por el cual ordenar (predeterminado: "id")    |
| orderDirection | No        | "asc" o "desc" (predeterminado: "asc")              |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "data": [
    {
      "id": "lab-test",
      "name": "Prueba de Laboratorio",
      "description": "Orden médica para pruebas de laboratorio"
    },
    {
      "id": "img-study",
      "name": "Estudio de Imagen",
      "description": "Orden médica para estudios de imagen"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### Obtener Tipo de Orden por ID

```http
GET /order-type/{id}
```

Recupera un tipo de orden específico por su ID.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |
| tenant_id     | Sí        | ID del tenant         |

#### Parámetros de Ruta

| Parámetro | Requerido | Descripción                      |
| --------- | --------- | -------------------------------- |
| id        | Sí        | ID del tipo de orden a recuperar |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "id": "lab-test",
  "name": "Prueba de Laboratorio",
  "description": "Orden médica para pruebas de laboratorio"
}
```

**Código de Estado**: 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Tipo de orden no encontrado",
  "error": "Not Found"
}
```

### Actualizar Tipo de Orden

```http
PATCH /order-type/{id}
```

Actualiza un tipo de orden existente.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |
| tenant_id     | Sí        | ID del tenant         |

#### Parámetros de Ruta

| Parámetro | Requerido | Descripción                       |
| --------- | --------- | --------------------------------- |
| id        | Sí        | ID del tipo de orden a actualizar |

#### Cuerpo de la Petición

```json
{
  "name": "Prueba de Laboratorio Actualizada",
  "description": "Descripción actualizada para pruebas de laboratorio"
}
```

| Campo       | Tipo   | Requerido | Descripción                             |
| ----------- | ------ | --------- | --------------------------------------- |
| name        | string | No        | Nuevo nombre para el tipo de orden      |
| description | string | No        | Nueva descripción para el tipo de orden |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "id": "lab-test",
  "name": "Prueba de Laboratorio Actualizada",
  "description": "Descripción actualizada para pruebas de laboratorio"
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Detalles de la solicitud incorrecta",
  "error": "Bad Request"
}
```

**Código de Estado**: 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Tipo de orden no encontrado",
  "error": "Not Found"
}
```

## Notas

- Los tipos de orden se utilizan para categorizar diferentes tipos de órdenes médicas en el sistema SEGIMED
- El ID del tipo de orden es opcional al crear; si no se proporciona, el sistema generará uno
- Al solicitar resultados paginados, puede controlar el ordenamiento y el tamaño de página
- Todos los campos son opcionales al actualizar un tipo de orden (se admiten actualizaciones parciales)
