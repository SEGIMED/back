# Documentación del Módulo de Usuario

## Descripción

El módulo de Usuario proporciona endpoints para la gestión de usuarios en la plataforma Segimed. Permite realizar operaciones como registro de usuarios, onboarding, y gestión de perfiles de usuario.

## Base URL

`/user`

## Requerimientos de Headers

La mayoría de los endpoints requieren el siguiente header:

- `tenant-id`: ID del tenant al que pertenece el usuario (string)

**Nota Importante**: El endpoint de onboarding NO requiere el header `tenant-id` ya que es precisamente el endpoint encargado de crear y asignar un nuevo tenant al usuario durante el proceso de registro.

## Endpoints

### Onboarding

Permite a un usuario completar el proceso de onboarding, creando un nuevo tenant y asociándolo al usuario.

- **URL**: `/user/onboarding`
- **Método**: `POST`
- **Descripción**: Completa el proceso de onboarding para un usuario registrado, creando y asignando un nuevo tenant
- **Permisos**: No requiere permisos especiales
- **Headers**: No requiere tenant-id (este endpoint crea el tenant)
- **Request Body**:

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Clínica Médica Especializada",
  "type": "organization",
  "number_of_employees": 10,
  "number_of_patients": 100,
  "reason_register": "Mejorar la gestión de pacientes y citas",
  "speciality": [1, 3, 5]
}
```

- **Parámetros**:

  - `user_id` (string, obligatorio): ID del usuario que completa el onboarding
  - `name` (string, obligatorio): Nombre de la organización o consultorio
  - `type` (enum, obligatorio): Tipo de tenant (individual u organización)
  - `number_of_employees` (number, opcional): Número de empleados (solo para organizaciones)
  - `number_of_patients` (number, opcional): Número de pacientes estimados
  - `reason_register` (string, obligatorio): Motivo de registro en la plataforma
  - `speciality` (array, obligatorio): IDs de las especialidades médicas

- **Respuesta exitosa**:

  - **Código**: 201 Created
  - **Contenido**: Objeto con el resultado del proceso de onboarding

- **Respuestas de error**:
  - **Código**: 400 Bad Request
    - Usuario no existente
    - El usuario ya es un médico
  - **Código**: 500 Internal Server Error
    - Error interno del servidor

### Listar Todos los Usuarios

Obtiene la lista de todos los usuarios registrados en el sistema dentro del tenant actual.

- **URL**: `/user`
- **Método**: `GET`
- **Descripción**: Obtiene todos los usuarios del tenant actual
- **Permisos**: Requiere autenticación y permisos administrativos
- **Headers Requeridos**:
  - `tenant-id`: ID del tenant
- **Respuesta exitosa**:
  - **Código**: 200 OK
  - **Contenido**: Array de objetos de usuarios pertenecientes al tenant

### Buscar Usuario por ID

Obtiene los detalles de un usuario específico por su ID dentro del tenant actual.

- **URL**: `/user/:id`
- **Método**: `GET`
- **Descripción**: Busca un usuario por su ID en el tenant actual
- **Permisos**: Requiere autenticación
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del usuario a buscar
- **Headers Requeridos**:
  - `tenant-id`: ID del tenant
- **Respuesta exitosa**:
  - **Código**: 200 OK
  - **Contenido**: Objeto con los detalles del usuario
- **Respuestas de error**:
  - **Código**: 404 Not Found
    - Usuario no encontrado en el tenant actual

### Buscar Usuario por Email

Obtiene los detalles de un usuario específico por su dirección de correo electrónico dentro del tenant actual.

- **URL**: `/user/email/:email`
- **Método**: `GET`
- **Descripción**: Busca un usuario por su dirección de email en el tenant actual
- **Permisos**: Requiere autenticación
- **Parámetros de ruta**:
  - `email` (string, obligatorio): Email del usuario a buscar
- **Headers Requeridos**:
  - `tenant-id`: ID del tenant
- **Respuesta exitosa**:
  - **Código**: 200 OK
  - **Contenido**: Objeto con los detalles del usuario
- **Respuestas de error**:
  - **Código**: 404 Not Found
    - Usuario no encontrado en el tenant actual

### Actualizar Usuario

Actualiza la información de un usuario existente dentro del tenant actual.

- **URL**: `/user/:id`
- **Método**: `PATCH`
- **Descripción**: Actualiza los datos de un usuario en el tenant actual
- **Permisos**: Requiere autenticación
- **Headers Requeridos**:
  - `tenant-id`: ID del tenant
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del usuario a actualizar
- **Request Body**:
  Los campos que se desean actualizar. Todos son opcionales:

```json
{
  "name": "Nuevo Nombre",
  "last_name": "Nuevo Apellido",
  "email": "nuevo.email@example.com",
  "dni": "12345678",
  "birth_date": "1990-01-01",
  "nationality": "Mexicana",
  "gender": "Masculino",
  "phone_prefix": "+52",
  "phone": "9876543210",
  "image": "https://example.com/profile.jpg",
  "role": "patient"
}
```

- **Respuesta exitosa**:
  - **Código**: 200 OK
  - **Contenido**: Objeto con los detalles actualizados del usuario

### Eliminar Usuario

Elimina un usuario del tenant actual.

- **URL**: `/user/:id`
- **Método**: `DELETE`
- **Descripción**: Elimina un usuario del tenant actual
- **Permisos**: Requiere autenticación y permisos administrativos
- **Headers Requeridos**:
  - `tenant-id`: ID del tenant
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del usuario a eliminar
- **Respuesta exitosa**:
  - **Código**: 200 OK
  - **Contenido**: Objeto confirmando la eliminación
- **Respuestas de error**:
  - **Código**: 404 Not Found
    - Usuario no encontrado en el tenant actual
  - **Código**: 403 Forbidden
    - No tiene permisos para eliminar usuarios en este tenant

## Modelos de Datos

### Usuario (User)

```typescript
{
  id?: string;
  name?: string;
  last_name?: string;
  email?: string;
  identification_number?: string;
  dniType?: string;
  birthdate?: Date;
  nationality?: string;
  gender?: string;
  phone_prefix?: string;
  phone?: string;
  password?: string;
  google_id?: string;
  image?: string;
  role?: role_type;
  tenant_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## DTOs (Data Transfer Objects)

### BaseUserDto

Contiene las propiedades básicas para un usuario:

```typescript
{
  name: string;               // Nombre del usuario
  last_name: string;          // Apellido del usuario
  email: string;              // Correo electrónico
  identification_number?: string; // Número de documento de identidad
  birth_date?: Date;          // Fecha de nacimiento
  nationality?: string;       // Nacionalidad
  gender?: string;            // Género
  phone_prefix?: string;      // Prefijo telefónico
  phone?: string;             // Número de teléfono
  image?: string;             // URL de la imagen de perfil
  role?: role_type;           // Rol en el sistema
}
```

### CreateUserDto

Extiende de BaseUserDto y añade:

```typescript
{
  // Todas las propiedades de BaseUserDto
  password?: string;          // Contraseña del usuario
}
```

### UpdateUserDto

Versión parcial de CreateUserDto, donde todos los campos son opcionales.

### OnboardingDto

```typescript
{
  user_id: string;                // ID del usuario que completa el onboarding
  name: string;                   // Nombre de la organización o consultorio
  type: tenant_type;              // Tipo de tenant (individual u organización)
  number_of_employees?: number;   // Número de empleados (solo para organizaciones)
  number_of_patients?: number;    // Número de pacientes estimados
  reason_register: string;        // Motivo de registro en la plataforma
  speciality?: number[];          // IDs de las especialidades médicas
}
```

## Notas Adicionales

- Los endpoints de usuario están etiquetados como `User` en la documentación Swagger.
- Todas las operaciones requieren autenticación mediante JWT.
- El proceso de onboarding es esencial para configurar adecuadamente el perfil de un usuario médico en la plataforma.
- Todos los endpoints, excepto el onboarding, requieren el header `tenant-id` y solo operan sobre usuarios dentro del tenant especificado.
- Los usuarios solo pueden ver y gestionar usuarios que pertenezcan a su mismo tenant.
- El endpoint de onboarding es el único que no requiere tenant-id ya que es el que crea un nuevo tenant.
