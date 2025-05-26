# API de Inicialización de Catálogos

Este módulo proporciona endpoints para inicializar varios catálogos con datos predefinidos. Estos endpoints están restringidos a usuarios SuperAdmin que tienen el permiso .

## Requisitos de Seguridad

- **Autenticación con Token Bearer**: Todos los endpoints requieren un token JWT válido en el header de Authorization.
- **ID de Tenant**: Todas las peticiones deben incluir el header `tenant_id`.
- **Permisos de SuperAdmin**: Todos los endpoints requieren rol de SuperAdmin y el permiso `CONFIGURE_SYSTEM_SETTINGS`.

## Endpoints

### Inicializar Todos los Catálogos

```http
POST /catalogs/seed
```

Inicializa todos los catálogos disponibles con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Todos los catálogos han sido inicializados correctamente"
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

### Inicializar Catálogo de Tipos de Estudio

```http
POST /catalogs/seed/study-types
```

Inicializa solo el catálogo de tipos de estudio con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de tipos de estudio inicializado correctamente"
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

### Inicializar Catálogo CIE-10

```http
POST /catalogs/seed/cie-diez
```

Inicializa solo el catálogo CIE-10 con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo CIE-10 inicializado correctamente"
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

### Inicializar Subcatálogo CIE-10

```http
POST /catalogs/seed/subcat-cie-diez
```

Inicializa solo el subcatálogo CIE-10 con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Subcatálogo CIE-10 inicializado correctamente"
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

### Inicializar Catálogo de Signos Vitales

```http
POST /catalogs/seed/vital-signs
```

Inicializa solo el catálogo de signos vitales con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de signos vitales inicializado correctamente"
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

### Inicializar Catálogo de Unidades de Medida

```http
POST /catalogs/seed/measure-units
```

Inicializa solo el catálogo de unidades de medida con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de unidades de medida inicializado correctamente"
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

### Inicializar Catálogo de Especialidades

```http
POST /catalogs/seed/specialties
```

Inicializa solo el catálogo de especialidades con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de especialidades inicializado correctamente"
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

### Inicializar Catálogo de Subsistemas Físicos

```http
POST /catalogs/seed/physical-subsystems
```

Inicializa solo el catálogo de subsistemas físicos con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de subsistemas físicos inicializado correctamente"
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

### Inicializar Catálogo de Áreas de Exploración Física

```http
POST /catalogs/seed/exploration-areas
```

Inicializa solo el catálogo de áreas de exploración física con datos predefinidos.

#### Headers

| Header        | Requerido | Descripción            |
|---------------|-----------|------------------------|
| Authorization | Sí        | Bearer {access_token}  |
| tenant_id     | Sí        | ID del tenant          |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Catálogo de áreas de exploración física inicializado correctamente"
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

- Estos endpoints solo son accesibles para usuarios con privilegios de SuperAdmin y el permiso requerido.
- Cada endpoint inicializa un catálogo específico con valores predefinidos.
- El endpoint principal `/catalogs/seed` inicializa todos los catálogos a la vez.
