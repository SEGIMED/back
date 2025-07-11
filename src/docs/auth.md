# Autenticación y Autorización (Auth) - API Endpoints

## Descripción

El módulo de Autenticación y Autorización gestiona todas las operaciones relacionadas con el registro de usuarios, inicio de sesión, gestión de contraseñas, verificación de identidad, y administración de roles y permisos. Este módulo es fundamental para la seguridad y el control de acceso de la plataforma SEGIMED.

## Endpoints Principales de Autenticación

### `POST /auth/register`

Registra un nuevo usuario en el sistema.

#### Request Body: `CreateUserDto`

```json
{
  "name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com",
  "password": "StrongP@ss123",
  "dni": "12345678",
  "phone_prefix": "+52",
  "phone": "9876543210",
  "role": "patient"
}
```

#### Responses

- `201 Created`: Usuario registrado exitosamente.

  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "role": "patient",
    "created_at": "2025-05-22T10:30:00.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

- `400 Bad Request`: Datos de usuario inválidos.
- `409 Conflict`: Correo electrónico ya en uso.

### `POST /auth`

Autentica a un usuario y devuelve un token JWT.

#### Request Body: `CreateAuthDto`

```json
{
  "email": "juan.perez@example.com",
  "password": "StrongP@ss123"
}
```

#### Responses

- `200 OK`: Autenticación exitosa.

  ```json
  {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenants": [
      {
        "id": "tid_12345-6789-abcd-ef0123456789",
        "name": "Hospital General"
      }
    ]
  }
  ```

- `401 Unauthorized`: Credenciales inválidas.

### `POST /auth/google`

Autentica a un usuario con credenciales de Google.

#### Request Body: `GoogleUserDto`

```json
{
  "token": "google_id_token_here",
  "google_id": "google_user_id",
  "name": "Juan",
  "last_name": "Pérez",
  "email": "juan.perez@example.com",
  "photo_url": "https://example.com/photo.jpg"
}
```

#### Responses

- `200 OK`: Autenticación exitosa con Google.
- `401 Unauthorized`: Credenciales de Google inválidas.

### `POST /auth/request-password`

Envía un correo electrónico con un enlace para restablecer la contraseña.

#### Request Body: `RequestPasswordDto`

```json
{
  "email": "juan.perez@example.com"
}
```

#### Responses

- `200 OK`: Correo de restablecimiento de contraseña enviado.
- `404 Not Found`: Usuario no encontrado.

### `POST /auth/reset-password`

Restablece la contraseña de un usuario utilizando un token.

#### Request Body: `ResetPasswordDto`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewStrongP@ss123"
}
```

#### Responses

- `200 OK`: Contraseña restablecida exitosamente.
- `400 Bad Request`: Token inválido o expirado.

### `POST /auth/send-otp`

Envía un código de verificación al teléfono del usuario.

#### Request Body

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "phone_prefix": "+52",
  "phone": "9876543210"
}
```

#### Responses

- `200 OK`: Código de verificación enviado.
- `400 Bad Request`: ID de usuario o número de teléfono inválido.

### `POST /auth/verify-otp`

Verifica el código OTP enviado al usuario.

#### Request Body

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "123456"
}
```

#### Responses

- `200 OK`: Código OTP verificado exitosamente.
- `400 Bad Request`: Código OTP inválido.

### `POST /auth/create-superadmin`

Crea un usuario superadministrador con privilegios completos. Requiere una clave secreta. Si el tenant del superadmin no existe, se creará automáticamente.

#### Request Body: `CreateSuperAdminDto`

```json
{
  "name": "Admin",
  "last_name": "Principal",
  "email": "admin@segimed.com",
  "password": "SuperStrongP@ss123",
  "secret_key": "supersecret_key_here",
  "tenant_id": "tid_12345-6789-abcd-ef0123456789"
}
```

#### Responses

- `201 Created`: Superadministrador creado exitosamente.
- `400 Bad Request`: Datos inválidos o clave secreta incorrecta.

#### Response Body (Success)

```json
{
  "message": "Superadmin creado exitosamente",
  "user": {
    "id": "user-uuid",
    "email": "admin@segimed.com",
    "name": "Admin",
    "last_name": "Principal",
    "role": "superadmin"
  },
  "tenant": {
    "id": "tenant-uuid",
    "type": "organization",
    "created": true
  }
}
```

#### Notas Importantes

- **Tenant Creation**: Si el tenant especificado en `SUPER_ADMIN_TENANT_ID` no existe, se creará automáticamente como tipo `organization`.
- **Secret Key**: La clave secreta debe coincidir con `SUPER_ADMIN_SECRET_KEY` en las variables de entorno.
- **Tenant ID**: El ID del tenant se obtiene automáticamente de `SUPER_ADMIN_TENANT_ID` en las variables de entorno.
- **Roles y Permisos**: Se asignan automáticamente todos los roles y permisos al superadmin creado.

## Endpoints de Gestión de Roles y Permisos

### `GET /roles`

Obtiene todos los roles disponibles. Requiere el permiso `CONFIGURE_USER_PERMISSIONS`.

#### Query Parameters

- `tenantId` (opcional): ID del tenant para filtrar roles específicos.

#### Responses

- `200 OK`: Lista de roles recuperada exitosamente.
- `403 Forbidden`: No tiene permisos para ver roles.

### `GET /roles/:id`

Obtiene un rol específico por su ID. Requiere el permiso `CONFIGURE_USER_PERMISSIONS`.

#### Path Parameters

- `id`: ID del rol a consultar.

#### Responses

- `200 OK`: Rol recuperado exitosamente.
- `404 Not Found`: Rol no encontrado.
- `403 Forbidden`: No tiene permisos para ver roles.

### `POST /roles`

Crea un nuevo rol. Requiere el permiso `CONFIGURE_USER_PERMISSIONS` y ser administrador del tenant.

#### Request Body

```json
{
  "name": "Médico Especialista",
  "description": "Médicos con acceso a funcionalidades avanzadas",
  "permissions": ["VIEW_PATIENT", "EDIT_MEDICAL_RECORD", "CREATE_PRESCRIPTION"],
  "tenantId": "tid_12345-6789-abcd-ef0123456789"
}
```

#### Responses

- `201 Created`: Rol creado exitosamente.
- `400 Bad Request`: Datos inválidos.
- `403 Forbidden`: No tiene permisos para crear roles.

### `PUT /roles/:id`

Actualiza un rol existente. Requiere el permiso `CONFIGURE_USER_PERMISSIONS` y ser administrador del tenant.

#### Path Parameters

- `id`: ID del rol a actualizar.

#### Request Body

```json
{
  "name": "Médico Especialista Senior",
  "description": "Médicos con privilegios ampliados",
  "permissions": [
    "VIEW_PATIENT",
    "EDIT_MEDICAL_RECORD",
    "CREATE_PRESCRIPTION",
    "APPROVE_STUDIES"
  ]
}
```

#### Responses

- `200 OK`: Rol actualizado exitosamente.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Rol no encontrado.
- `403 Forbidden`: No tiene permisos para actualizar roles.

### `POST /roles/assign`

Asigna un rol a un usuario. Requiere el permiso `CONFIGURE_USER_PERMISSIONS` y ser administrador del tenant.

#### Request Body

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "roleId": "rol_12345-6789-abcd-ef0123456789"
}
```

#### Responses

- `200 OK`: Rol asignado exitosamente al usuario.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Usuario o rol no encontrado.
- `403 Forbidden`: No tiene permisos para asignar roles.

### `DELETE /roles/assign`

Elimina un rol de un usuario. Requiere el permiso `CONFIGURE_USER_PERMISSIONS` y ser administrador del tenant.

#### Request Body

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "roleId": "rol_12345-6789-abcd-ef0123456789"
}
```

#### Responses

- `200 OK`: Rol eliminado exitosamente del usuario.
- `400 Bad Request`: Datos inválidos.
- `404 Not Found`: Usuario o rol no encontrado.
- `403 Forbidden`: No tiene permisos para eliminar roles de usuarios.

### `GET /roles/permissions`

Obtiene todos los permisos disponibles en el sistema. Requiere el permiso `CONFIGURE_USER_PERMISSIONS`.

#### Responses

- `200 OK`: Lista de permisos recuperada exitosamente.
- `403 Forbidden`: No tiene permisos para ver permisos.

### `GET /roles/user/:userId`

Obtiene todos los roles asignados a un usuario específico. Requiere el permiso `CONFIGURE_USER_PERMISSIONS`.

#### Path Parameters

- `userId`: ID del usuario cuya información de roles se desea consultar.

#### Responses

- `200 OK`: Roles del usuario recuperados exitosamente.
- `404 Not Found`: Usuario no encontrado.
- `403 Forbidden`: No tiene permisos para ver roles de usuarios.

### `POST /roles/seed`

Inicializa roles y permisos predeterminados en el sistema. Solo accesible para superadministradores.

#### Responses

- `201 Created`: Roles y permisos inicializados exitosamente.
- `400 Bad Request`: Error al crear roles y permisos.
- `403 Forbidden`: No tiene permisos de superadministrador.

### `POST /permission-updater/update-default-permissions`

Actualiza los permisos predeterminados para médicos y pacientes. Este endpoint solo es accesible para superadministradores.

#### Responses

- `200 OK`: Permisos predeterminados actualizados exitosamente.
- `403 Forbidden`: No tiene permisos de superadministrador.

## Flujos de Autenticación

### Registro e Inicio de Sesión Normal

1. El usuario se registra con `POST /auth/register`
2. El sistema envía un correo de verificación o un código OTP
3. El usuario verifica su cuenta (si es necesario)
4. El usuario inicia sesión con `POST /auth`
5. El sistema devuelve un token JWT para autenticación subsiguiente

### Inicio de Sesión con Google

1. El usuario inicia el flujo de autenticación con Google en el frontend
2. Una vez autenticado con Google, el frontend recibe un token de ID
3. El frontend envía este token a `POST /auth/google`
4. El sistema verifica el token con Google, crea o recupera el usuario y devuelve un token JWT

### Restablecimiento de Contraseña

1. El usuario solicita restablecer su contraseña con `POST /auth/request-password`
2. El sistema envía un correo electrónico con un enlace que contiene un token JWT
3. El usuario accede al enlace y proporciona una nueva contraseña
4. El frontend envía la nueva contraseña y el token a `POST /auth/reset-password`
5. El sistema verifica el token, actualiza la contraseña y confirma el cambio

## Consideraciones de Seguridad

- Todos los endpoints que modifican roles y permisos requieren privilegios de administrador de tenant o superadministrador.
- La creación de superadministradores está protegida por una clave secreta.
- Los tokens JWT tienen un tiempo de expiración configurado.
- Las contraseñas deben cumplir con requisitos de seguridad (longitud mínima, combinación de caracteres).
- La autenticación de dos factores (2FA) está disponible a través del sistema OTP.
- Todas las contraseñas se almacenan hasheadas, no en texto plano.

## Integración con Otros Módulos

- **Módulo de Usuarios**: Gestiona la información de los usuarios y su perfil.
- **Módulo de Tenants**: Administra la estructura multitenancy de la plataforma.
- **Módulo de Verificación**: Maneja la verificación de identidad de los usuarios.
- **Servicios de Email y SMS**: Para enviar notificaciones y códigos de verificación.
