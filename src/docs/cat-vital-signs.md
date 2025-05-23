# API de Catálogo de Signos Vitales

Este módulo proporciona endpoints para gestionar el catálogo de signos vitales en la plataforma SEGIMED.

## Requisitos de Seguridad

- **Autenticación con Token Bearer**: Todos los endpoints requieren un token JWT válido en el header de Authorization.
- **ID de Tenant**: Todas las peticiones deben incluir el header `tenant_id`.
- **Permisos**: Las diferentes operaciones requieren permisos específicos como se detalla en cada endpoint.

## Endpoints

### Crear un Signo Vital

```http
POST /cat-vital-signs
```

Crea un nuevo signo vital en el catálogo.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Permiso Requerido

`MANAGE_CATALOGS` - Adicionalmente requiere rol de SuperAdmin

#### Cuerpo de la Petición

```json
{
  "name": "Frecuencia Cardíaca",
  "category": "Cardiovascular",
  "specialties": [1, 2, 3]
}
```

| Campo       | Tipo     | Descripción                                      |
|-------------|----------|--------------------------------------------------|
| name        | string   | Nombre del signo vital                           |
| category    | string   | Categoría a la que pertenece el signo vital      |
| specialties | number[] | Array de IDs de especialidades relacionadas      |

#### Respuesta

**Código de Estado**: 201 Created

```json
{
  "id": 1,
  "name": "Frecuencia Cardíaca",
  "category": "Cardiovascular",
  "specialties": [1, 2, 3]
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

**Código de Estado**: 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Recurso prohibido",
  "error": "Forbidden"
}
```

### Obtener Todos los Signos Vitales

```http
GET /cat-vital-signs
```

Recupera una lista de todos los signos vitales, opcionalmente filtrados por IDs de especialidad.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Permiso Requerido

`VIEW_DOCTORS_LIST`

#### Parámetros de Consulta

| Parámetro    | Requerido | Descripción                                          |
|--------------|-----------|------------------------------------------------------|
| specialtyIds | No        | Lista de IDs de especialidad separados por coma (ej. "1,2,3") |

#### Respuesta

**Código de Estado**: 200 OK

```json
[
  {
    "id": 1,
    "name": "Frecuencia Cardíaca",
    "category": "Cardiovascular",
    "specialties": [1, 2]
  },
  {
    "id": 2,
    "name": "Temperatura",
    "category": "Vital",
    "specialties": [1, 3, 4]
  }
]
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "ID de especialidad inválido: abc",
  "error": "Bad Request"
}
```

### Eliminar un Signo Vital

```http
DELETE /cat-vital-signs/{id}
```

Elimina un signo vital del catálogo.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Permiso Requerido

`MANAGE_CATALOGS` - Adicionalmente requiere rol de SuperAdmin

#### Parámetros de Ruta

| Parámetro | Requerido | Descripción                     |
|-----------|-----------|----------------------------------|
| id        | Sí        | ID del signo vital a eliminar   |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Signo vital con ID 1 ha sido eliminado"
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "ID inválido",
  "error": "Bad Request"
}
```

**Código de Estado**: 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Recurso prohibido",
  "error": "Forbidden"
}
```

## Notas

- Esta API está diseñada para gestionar los signos vitales utilizados en evaluaciones médicas
- Los signos vitales pueden estar asociados con múltiples especialidades médicas
- Solo los usuarios SuperAdmin pueden crear o eliminar signos vitales
- Los usuarios regulares con el permiso apropiado pueden ver la lista de signos vitales
