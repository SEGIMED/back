# Roles API

## Descripción general

El módulo de Roles proporciona funcionalidades para la gestión de roles y permisos en el sistema, permitiendo asignar diferentes niveles de acceso a usuarios según sus funciones. Esto incluye la creación, actualización, eliminación y asignación de roles a usuarios, así como la gestión de los permisos asociados a cada rol.

## Requisitos

- **Header de Autenticación**: Bearer token JWT válido.
- **Header de Tenant**: `tenant-id` requerido para todas las operaciones (excepto seed).
- **Permisos**: Se requiere el permiso `CONFIGURE_USER_PERMISSIONS` para la mayoría de las operaciones.
- **Guardias**: Diferentes endpoints están protegidos por guardias como `TenantAccessGuard`, `TenantAdminGuard` y `SuperAdminGuard`.

## Endpoints

### 1. Gestión de Roles

#### 1.1. Obtener todos los roles

```http
GET /roles
```

**Parámetros de consulta:**

- `tenantId` (opcional): ID del tenant para filtrar roles específicos.

**Respuestas:**

- `200 OK`: Lista de roles recuperada exitosamente.
- `403 Forbidden`: No tiene permisos para ver roles.

#### 1.2. Obtener un rol específico

```http
GET /roles/{id}
```

**Parámetros de ruta:**

- `id`: ID del rol a consultar.

**Respuestas:**

- `200 OK`: Rol recuperado exitosamente.
- `404 Not Found`: Rol no encontrado.
- `403 Forbidden`: No tiene permisos para ver roles.

#### 1.3. Crear un nuevo rol

```http
POST /roles
```

**Cuerpo de la solicitud:**

```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"],
  "tenantId": "string"
}
```

**Respuestas:**

- `201 Created`: Rol creado exitosamente.
- `400 Bad Request`: Datos inválidos.
- `403 Forbidden`: No tiene permisos para crear roles.

#### 1.4. Actualizar un rol existente

```http
PUT /roles/{id}
```

**Parámetros de ruta:**

- `id`: ID del rol a actualizar.

**Cuerpo de la solicitud:**

```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

**Respuestas:**

- `200 OK`: Rol actualizado exitosamente.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Rol no encontrado.
- `403 Forbidden`: No tiene permisos para actualizar roles.

#### 1.5. Eliminar un rol

```http
DELETE /roles/{id}
```

**Parámetros de ruta:**

- `id`: ID del rol a eliminar.

**Respuestas:**

- `200 OK`: Rol eliminado exitosamente.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Rol no encontrado.
- `403 Forbidden`: No tiene permisos para eliminar roles.

### 2. Asignación de Roles

#### 2.1. Asignar rol a usuario

```http
POST /roles/assign
```

**Cuerpo de la solicitud:**

```json
{
  "userId": "string",
  "roleId": "string"
}
```

**Respuestas:**

- `200 OK`: Rol asignado exitosamente al usuario.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Usuario o rol no encontrado.
- `403 Forbidden`: No tiene permisos para asignar roles.

#### 2.2. Eliminar rol de un usuario

```http
DELETE /roles/assign
```

**Cuerpo de la solicitud:**

```json
{
  "userId": "string",
  "roleId": "string"
}
```

**Respuestas:**

- `200 OK`: Rol eliminado exitosamente del usuario.
- `400 Bad Request`: Datos inválidos o error en la operación.
- `404 Not Found`: Usuario o rol no encontrado.

#### 2.3. Obtener roles de un usuario

```http
GET /roles/user/{userId}
```

**Parámetros de ruta:**

- `userId`: ID del usuario.

**Respuestas:**

- `200 OK`: Roles del usuario recuperados exitosamente.
- `404 Not Found`: Usuario no encontrado.
- `403 Forbidden`: No tiene permisos para ver roles de usuarios.

### 3. Permisos

#### 3.1. Obtener todos los permisos disponibles

```http
GET /roles/permissions
```

**Respuestas:**

- `200 OK`: Lista de permisos recuperada exitosamente.
- `403 Forbidden`: No tiene permisos para ver permisos.

### 4. Inicialización del Sistema

#### 4.1. Inicializar roles y permisos predeterminados

```http
POST /roles/seed
```

**Respuestas:**

- `201 Created`: Roles y permisos inicializados exitosamente.
- `400 Bad Request`: Error al crear roles y permisos.
- `403 Forbidden`: No tiene permisos de superadministrador.

## Notas Adicionales

- Las operaciones de creación, actualización y eliminación de roles solo están disponibles para administradores de tenant.
- La operación de seed solo está disponible para superadministradores.
- Se recomienda revisar los permisos del sistema antes de crear o actualizar roles.
