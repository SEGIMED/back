# Catálogo de Tipos de Identificación - API Endpoints

Este documento describe los endpoints para gestionar el catálogo de tipos de identificación.

**Todos los endpoints en este módulo requieren autenticación y el permiso `MANAGE_CATALOGS`.**

## Descripción

El catálogo de tipos de identificación permite gestionar los diferentes tipos de documentos de identidad que pueden utilizar los usuarios del sistema, organizados por país. Esto incluye cédulas de ciudadanía, pasaportes, DNI, etc.

## Endpoints

### `POST /cat-identification-type`

Crea un nuevo tipo de identificación en el catálogo.

**Headers:**

- `Authorization` (string, required): Bearer token JWT.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `MANAGE_CATALOGS`: Gestionar catálogos del sistema.

**Request Body:**

```json
{
  "name": "string (Nombre del tipo de identificación)",
  "description": "string (Descripción opcional)",
  "country": "string (País donde es válido este tipo)"
}
```

**Ejemplo:**

```json
{
  "name": "Cédula de Ciudadanía",
  "description": "Documento de identificación nacional para ciudadanos",
  "country": "Colombia"
}
```

**Validaciones:**

- `name`: Requerido, string entre 1-100 caracteres
- `description`: Opcional, string máximo 255 caracteres
- `country`: Requerido, string entre 1-100 caracteres

**Responses:**

- `201 Created`: El tipo de identificación ha sido creado exitosamente.
  ```json
  {
    "id": 1,
    "name": "Cédula de Ciudadanía",
    "description": "Documento de identificación nacional para ciudadanos",
    "country": "Colombia",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
  ```
- `400 Bad Request`: Datos de entrada inválidos.
- `403 Forbidden`: No tiene permisos para gestionar catálogos.

### `GET /cat-identification-type`

Obtiene todos los tipos de identificación del catálogo.

**Headers:**

- `Authorization` (string, required): Bearer token JWT.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `MANAGE_CATALOGS`: Gestionar catálogos del sistema.

**Query Parameters:**

- `country` (string, optional): Filtrar por país (búsqueda insensible a mayúsculas).

**Responses:**

- `200 OK`: Lista de tipos de identificación.
  ```json
  [
    {
      "id": 1,
      "name": "Cédula de Ciudadanía",
      "description": "Documento de identificación nacional para ciudadanos",
      "country": "Colombia",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Pasaporte",
      "description": "Documento de viaje internacional",
      "country": "Colombia",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  ]
  ```
- `400 Bad Request`: Error al obtener los datos.
- `403 Forbidden`: No tiene permisos para ver catálogos.

**Ejemplos de uso:**

```bash
# Obtener todos los tipos
GET /cat-identification-type

# Filtrar por país
GET /cat-identification-type?country=Colombia
GET /cat-identification-type?country=argentina
```

### `GET /cat-identification-type/{id}`

Obtiene un tipo de identificación específico por su ID.

**Headers:**

- `Authorization` (string, required): Bearer token JWT.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `MANAGE_CATALOGS`: Gestionar catálogos del sistema.

**Path Parameters:**

- `id` (number): ID del tipo de identificación.

**Responses:**

- `200 OK`: Detalles del tipo de identificación.
  ```json
  {
    "id": 1,
    "name": "Cédula de Ciudadanía",
    "description": "Documento de identificación nacional para ciudadanos",
    "country": "Colombia",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
  ```
- `400 Bad Request`: ID inválido.
- `403 Forbidden`: No tiene permisos para ver catálogos.
- `404 Not Found`: Tipo de identificación no encontrado.

### `PATCH /cat-identification-type/{id}`

Actualiza un tipo de identificación específico por su ID.

**Headers:**

- `Authorization` (string, required): Bearer token JWT.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `MANAGE_CATALOGS`: Gestionar catálogos del sistema.

**Path Parameters:**

- `id` (number): ID del tipo de identificación a actualizar.

**Request Body:**

Todos los campos son opcionales (partial update):

```json
{
  "name": "string (opcional)",
  "description": "string (opcional)",
  "country": "string (opcional)"
}
```

**Ejemplo:**

```json
{
  "description": "Documento nacional de identificación actualizado"
}
```

**Responses:**

- `200 OK`: El tipo de identificación ha sido actualizado exitosamente.
  ```json
  {
    "id": 1,
    "name": "Cédula de Ciudadanía",
    "description": "Documento nacional de identificación actualizado",
    "country": "Colombia",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T15:45:00.000Z"
  }
  ```
- `400 Bad Request`: Datos de entrada inválidos.
- `403 Forbidden`: No tiene permisos para gestionar catálogos.
- `404 Not Found`: Tipo de identificación no encontrado.

### `DELETE /cat-identification-type/{id}`

Elimina un tipo de identificación específico por su ID.

**Headers:**

- `Authorization` (string, required): Bearer token JWT.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `MANAGE_CATALOGS`: Gestionar catálogos del sistema.

**Path Parameters:**

- `id` (number): ID del tipo de identificación a eliminar.

**Responses:**

- `200 OK`: El tipo de identificación ha sido eliminado exitosamente.
  ```json
  {
    "id": 1,
    "name": "Cédula de Ciudadanía",
    "description": "Documento de identificación nacional para ciudadanos",
    "country": "Colombia",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
  ```
- `403 Forbidden`: No tiene permisos para gestionar catálogos.
- `404 Not Found`: Tipo de identificación no encontrado.

## Consideraciones de Seguridad

- **Autenticación requerida**: Todos los endpoints requieren un JWT válido.
- **Autorización por permisos**: Se requiere el permiso `MANAGE_CATALOGS`.
- **Tenant isolation**: Se aplican las políticas de tenant del sistema.

## Validaciones de Datos

### Campos Requeridos

- `name`: Nombre del tipo de identificación
- `country`: País donde es válido

### Límites de Caracteres

- `name`: 1-100 caracteres
- `description`: 0-255 caracteres (opcional)
- `country`: 1-100 caracteres

### Tipos de Datos

- Todos los campos de texto son strings
- `id` es un entero autoincremental
- Fechas en formato ISO 8601

## Casos de Uso Comunes

### Configuración Inicial del Sistema

```bash
# Crear tipos de identificación para Colombia
POST /cat-identification-type
{
  "name": "Cédula de Ciudadanía",
  "description": "Documento nacional de Colombia",
  "country": "Colombia"
}

POST /cat-identification-type
{
  "name": "Tarjeta de Identidad",
  "description": "Para menores de edad en Colombia",
  "country": "Colombia"
}
```

### Gestión por País

```bash
# Obtener tipos disponibles para un país específico
GET /cat-identification-type?country=Argentina

# Listar todos para revisión
GET /cat-identification-type
```

### Mantenimiento de Catálogo

```bash
# Actualizar descripción
PATCH /cat-identification-type/1
{
  "description": "Descripción actualizada del documento"
}

# Eliminar tipo obsoleto
DELETE /cat-identification-type/5
```

## Integración con Otros Módulos

- **User Management**: Los usuarios referencian este catálogo en el campo `identification_type_id`
- **Patient Registration**: Se utiliza durante el registro de pacientes
- **Authentication**: Los tipos de identificación son parte del perfil de usuario
