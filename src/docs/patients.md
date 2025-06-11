# Documentación del Módulo de Pacientes (Patients)

## Descripción

El módulo de Pacientes proporciona endpoints para la gestión completa de los pacientes en la plataforma Segimed. Permite realizar operaciones como crear, listar, modificar y eliminar pacientes, así como gestionar toda la información asociada a ellos.

## Base URL

`/patient`

## Requerimientos de Headers

Todos los endpoints requieren los siguientes headers:

- `Authorization`: Bearer token JWT para autenticación
- `X-Tenant-ID`: ID del tenant al que pertenece el usuario y los pacientes

## Permisos Requeridos

Los endpoints del módulo de pacientes requieren permisos específicos:

- `MANAGE_USERS`: Para crear pacientes
- `VIEW_PATIENTS_LIST`: Para listar pacientes
- `VIEW_PATIENT_DETAILS`: Para ver los detalles de un paciente
- `EDIT_PATIENT_INFO`: Para editar la información de un paciente
- `DELETE_PATIENTS`: Para eliminar pacientes

## Endpoints

### Crear Paciente

Crea un nuevo paciente en el sistema, incluyendo la información de usuario asociada.

- **URL**: `/patient`
- **Método**: `POST`
- **Descripción**: Crea un nuevo paciente en el sistema
- **Permisos**: `MANAGE_USERS`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT
  - `X-Tenant-ID`: ID del tenant
- **Request Body**:

```json
{
  "user": {
    "name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@example.com",
    "dni": "12345678",
    "birth_date": "1990-01-01",
    "nationality": "Mexicana",
    "gender": "Masculino",
    "phone_prefix": "+52",
    "phone": "9876543210",
    "image": "https://example.com/profile.jpg"
  },
  "patient": {
    "direction": "Av. Insurgentes Sur",
    "country": "México",
    "province": "Ciudad de México",
    "city": "Coyoacán",
    "postal_code": "04510",
    "direction_number": "3000",
    "apartment": "42B",
    "health_care_number": "IMSS-12345678"
  }
}
```

- **Respuesta exitosa**:

  - **Código**: 201 Created
  - **Contenido**: Objeto con los datos del paciente creado

- **Respuestas de error**:
  - **Código**: 400 Bad Request
    - Datos inválidos
    - El usuario ya existe para esta organización
  - **Código**: 401 Unauthorized
    - No autenticado
  - **Código**: 403 Forbidden
    - Permisos insuficientes

### Listar Todos los Pacientes

Obtiene la lista de todos los pacientes registrados en el sistema para el tenant actual.

- **URL**: `/patient`
- **Método**: `GET`
- **Descripción**: Retorna una lista paginada de todos los pacientes
- **Permisos**: `VIEW_PATIENTS_LIST`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT
  - `X-Tenant-ID`: ID del tenant
- **Parámetros de consulta**:
  - `page` (número, opcional): Número de página para paginación, por defecto 1
  - `limit` (número, opcional): Cantidad de registros por página, por defecto 10
  - `search` (string, opcional): Término de búsqueda
- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Array paginado de objetos paciente

  ```json
  {
    "items": [
      {
        "id": "uuid-1",
        "name": "Juan",
        "last_name": "Pérez",
        "image": "https://example.com/profile.jpg",
        "birth_date": "1990-01-01T00:00:00.000Z",
        "gender": "Masculino",
        "email": "juan.perez@example.com",
        "phone": "9876543210",
        "prefix": "+52",
        "dni": "12345678",
        "health_care_number": "IMSS-12345678"
      }
    ],
    "meta": {
      "totalItems": 50,
      "itemCount": 10,
      "itemsPerPage": 10,
      "totalPages": 5,
      "currentPage": 1
    }
  }
  ```

- **Respuestas de error**:
  - **Código**: 401 Unauthorized
    - No autenticado
  - **Código**: 403 Forbidden
    - Permisos insuficientes

### Obtener Paciente por ID

Obtiene los detalles completos de un paciente específico.

- **URL**: `/patient/:id`
- **Método**: `GET`
- **Descripción**: Retorna los detalles de un paciente específico
- **Permisos**: `VIEW_PATIENT_DETAILS`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT
  - `X-Tenant-ID`: ID del tenant
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del paciente a consultar
- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Objeto con los detalles completos del paciente

  ```json
  {
    "id": "uuid-1",
    "name": "Juan",
    "last_name": "Pérez",
    "image": "https://example.com/profile.jpg",
    "birth_date": "1990-01-01T00:00:00.000Z",
    "email": "juan.perez@example.com",
    "notes": "Observaciones médicas del paciente",
    "vital_signs": [
      {
        "id": "vs-uuid-1",
        "vital_sign_category": "Presión arterial",
        "measure": 120,
        "vital_sign_measure_unit": "mmHg"
      }
    ],
    "files": [
      {
        "id": "file-uuid-1",
        "name": "Radiografía",
        "url": "https://example.com/files/radiografia.jpg"
      }
    ],
    "evaluation": {
      "id": "eval-uuid-1",
      "details": "Evaluación médica",
      "date": "2025-05-20T10:30:00.000Z"
    },
    "background": {
      "id": "bg-uuid-1",
      "details": "Antecedentes médicos",
      "date": "2025-05-15T14:00:00.000Z"
    },
    "current_medication": [
      {
        "id": "med-uuid-1",
        "name": "Paracetamol",
        "dosage": "500mg",
        "instructions": "Cada 8 horas",
        "active": true
      }
    ],
    "future_medical_events": [
      {
        "id": "event-uuid-1",
        "date": "2025-06-15T00:00:00.000Z",
        "time": "10:00",
        "doctor": "Dr. García",
        "reason": "Revisión general",
        "status": "Programada"
      }
    ],
    "past_medical_events": [
      {
        "id": "event-uuid-2",
        "date": "2025-05-01T00:00:00.000Z",
        "time": "15:30",
        "doctor": "Dra. Rodríguez",
        "reason": "Consulta inicial",
        "status": "Completada"
      }
    ]
  }
  ```

- **Respuestas de error**:
  - **Código**: 404 Not Found
    - Paciente no encontrado
  - **Código**: 401 Unauthorized
    - No autenticado
  - **Código**: 403 Forbidden
    - Permisos insuficientes

### Actualizar Paciente

Actualiza la información de un paciente existente.

- **URL**: `/patient/:id`
- **Método**: `PATCH`
- **Descripción**: Actualiza los datos de un paciente
- **Permisos**: `EDIT_PATIENT_INFO`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT
  - `X-Tenant-ID`: ID del tenant
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del paciente a actualizar
- **Request Body**: Igual que en la creación, pero todos los campos son opcionales

- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Objeto con los detalles actualizados del paciente

- **Respuestas de error**:
  - **Código**: 400 Bad Request
    - Datos inválidos
  - **Código**: 404 Not Found
    - Paciente no encontrado
  - **Código**: 401 Unauthorized
    - No autenticado
  - **Código**: 403 Forbidden
    - Permisos insuficientes

### Eliminar Paciente

Elimina un paciente del sistema.

- **URL**: `/patient/:id`
- **Método**: `DELETE`
- **Descripción**: Elimina un paciente
- **Permisos**: `DELETE_PATIENTS`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT
  - `X-Tenant-ID`: ID del tenant
- **Parámetros de ruta**:
  - `id` (string, obligatorio): ID del paciente a eliminar
- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Objeto confirmando la eliminación

- **Respuestas de error**:
  - **Código**: 404 Not Found
    - Paciente no encontrado
  - **Código**: 401 Unauthorized
    - No autenticado
  - **Código**: 403 Forbidden
    - Permisos insuficientes

## Modelos de Datos

### MedicalPatientDto

Combina la información de usuario y paciente para su creación o actualización:

```typescript
{
  user: {
    name: string;               // Nombre del usuario
    last_name: string;          // Apellido del usuario
    email: string;              // Correo electrónico
    dni?: string;               // Número de documento de identidad
    birth_date?: Date;          // Fecha de nacimiento
    nationality?: string;       // Nacionalidad
    gender?: string;            // Género
    phone_prefix?: string;      // Prefijo telefónico
    phone?: string;             // Número de teléfono
    image?: string;             // URL de la imagen de perfil
  };

  patient: {
    direction?: string;         // Dirección (calle)
    country: string;            // País
    province: string;           // Provincia/Estado
    city: string;               // Ciudad
    postal_code: string;        // Código postal
    direction_number?: string;  // Número de dirección
    apartment?: string;         // Apartamento/Piso
    health_care_number?: string; // Número de seguro médico
  };
}
```

### GetPatientsDto

Información resumida de pacientes para listados:

```typescript
{
  id: string; // ID del paciente
  name: string; // Nombre
  last_name: string; // Apellido
  image: string; // URL de la imagen de perfil
  birth_date: Date; // Fecha de nacimiento
  gender: string; // Género
  email: string; // Correo electrónico
  phone: string; // Número de teléfono
  prefix: string; // Prefijo telefónico
  dni: string; // Número de documento de identidad
  health_care_number: string; // Número de seguro médico
}
```

### GetPatientDto

Información detallada de un paciente incluyendo datos médicos:

```typescript
{
  id: string;                   // ID del paciente
  name: string;                 // Nombre
  last_name: string;            // Apellido
  image: string;                // URL de la imagen de perfil
  birth_date: Date;             // Fecha de nacimiento
  email: string;                // Correo electrónico
  notes: string;                // Notas médicas
  vital_signs: VitalSignDto[];  // Signos vitales
  files: FileDto[];             // Archivos médicos
  evaluation: EvaluationDto;    // Evaluación médica
  background: BackgroundDto;    // Antecedentes médicos
  current_medication: MedicationDto[]; // Medicación actual
  future_medical_events: MedicalEventDto[]; // Eventos médicos futuros
  past_medical_events: MedicalEventDto[];   // Eventos médicos pasados
}
```

## Notas Adicionales

- Los endpoints de pacientes están etiquetados como `Patients` en la documentación Swagger.
- Todas las operaciones requieren autenticación mediante JWT.
- El sistema utiliza un modelo multi-tenant, por lo que es necesario especificar el tenant-id en todas las operaciones.
- Al crear un paciente, se genera automáticamente una contraseña y se envía por correo electrónico al usuario.
- Los pacientes son usuarios con el rol `patient` en el sistema.
- Cada paciente puede estar asociado a múltiples tenants a través de la tabla `patient_tenant`.
- El sistema implementa paginación para las consultas de listado de pacientes.
