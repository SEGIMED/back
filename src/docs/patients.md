# Documentación del Módulo de Pacientes (Patients)

## Descripción

El módulo de Pacientes proporciona endpoints para la gestión completa de los pacientes en la plataforma Segimed. Permite realizar operaciones como crear, listar, modificar y eliminar pacientes, así como gestionar toda la información asociada a ellos.

**Incluye endpoints móviles especializados** que permiten a los pacientes autenticados acceder y actualizar su propio perfil de manera segura desde aplicaciones móviles, con soporte automático multitenant.

## Base URL

`/patient`

## Requerimientos de Headers

Todos los endpoints requieren los siguientes headers:

- `Authorization`: Bearer token JWT para autenticación
- `X-Tenant-ID`: ID del tenant al que pertenece el usuario y los pacientes

## Permisos Requeridos

Los endpoints del módulo de pacientes requieren permisos específicos:

### Para Gestión de Pacientes (Profesionales)

- `MANAGE_USERS`: Para crear pacientes
- `VIEW_PATIENTS_LIST`: Para listar pacientes
- `VIEW_PATIENT_DETAILS`: Para ver los detalles de un paciente
- `EDIT_PATIENT_INFO`: Para editar la información de un paciente
- `DELETE_PATIENTS`: Para eliminar pacientes

### Para Endpoints Móviles (Pacientes) 📱

- `VIEW_OWN_SETTINGS`: Para que los pacientes vean su propio perfil completo
- `UPDATE_OWN_SETTINGS`: Para que los pacientes actualicen su propio perfil

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
    - No autenticado - **Código**: 403 Forbidden
    - Permisos insuficientes

## Endpoints Móviles para Pacientes 📱

Los siguientes endpoints están diseñados específicamente para aplicaciones móviles y permiten a los pacientes autenticados gestionar su información personal de manera segura y eficiente.

### Obtener Mi Perfil (Mobile)

Permite a un paciente autenticado obtener su perfil completo incluyendo datos de todas sus organizaciones.

- **URL**: `/patient/my-profile`
- **Método**: `GET`
- **Descripción**: Obtiene el perfil completo del paciente autenticado con soporte multitenant
- **Permisos**: `VIEW_OWN_SETTINGS`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT (el patient_id se extrae automáticamente del token)
- **Características especiales**:

  - ✅ **ID automático**: El patient_id se obtiene del JWT token, no requiere parámetros
  - ✅ **Multitenant**: Accede automáticamente a datos de todas las organizaciones del paciente
  - ✅ **Datos consolidados**: Unifica información médica de múltiples fuentes
  - ✅ **Optimizado para móvil**: Respuesta estructurada para consumo móvil

- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Objeto con el perfil completo del paciente

  ```json
  {
    "id": "uuid-patient",
    "name": "Juan",
    "last_name": "Pérez",
    "image": "https://example.com/patient.jpg",
    "age": 35,
    "birth_date": "1989-01-15T00:00:00Z",
    "direction": "Av. Principal 123, Col. Centro",
    "city": "Ciudad de México",
    "province": "CDMX",
    "country": "México",
    "postal_code": "12345",
    "phone": "+1234567890",
    "email": "juan.perez@example.com",
    "notes": "Notas del paciente",
    "vital_signs": [
      {
        "id": "uuid-vital-sign",
        "vital_sign_category": "Presión Arterial",
        "measure": 120,
        "vital_sign_measure_unit": "mmHg"
      }
    ],
    "files": [
      {
        "id": "uuid-file",
        "name": "Radiografía de Tórax",
        "url": "https://example.com/file.pdf"
      }
    ],
    "evaluation": {
      "id": "uuid-evaluation",
      "details": "Evaluación médica reciente",
      "date": "2024-01-10T15:30:00Z"
    },
    "background": {
      "id": "uuid-background",
      "details": "Antecedentes médicos completos",
      "date": "2024-01-01T00:00:00Z"
    },
    "current_medication": [
      {
        "id": "uuid-medication",
        "name": "Aspirina",
        "dosage": "100 mg",
        "instructions": "Cada 8 horas, durante 7 días",
        "active": true
      }
    ],
    "future_medical_events": [
      {
        "id": "uuid-appointment",
        "date": "2024-01-20T10:00:00Z",
        "time": "10:00",
        "doctor": "Dr. García",
        "reason": "Control general",
        "status": "pendiente"
      }
    ],
    "past_medical_events": [
      {
        "id": "uuid-past-appointment",
        "date": "2024-01-05T14:00:00Z",
        "time": "14:00",
        "doctor": "Dr. Martínez",
        "reason": "Consulta general",
        "status": "atendida"
      }
    ]
  }
  ```

- **Respuestas de error**:
  - **Código**: 400 Bad Request
    - Usuario no autenticado
    - Usuario no es paciente
  - **Código**: 401 Unauthorized
    - Token JWT inválido o faltante
  - **Código**: 403 Forbidden
    - Permisos insuficientes para ver configuraciones propias
  - **Código**: 404 Not Found
    - No se encontraron organizaciones asociadas al paciente

### Actualizar Mi Perfil (Mobile)

Permite a un paciente autenticado actualizar su información personal con soporte para actualizaciones parciales.

- **URL**: `/patient/my-profile`
- **Método**: `PATCH`
- **Descripción**: Actualiza el perfil del paciente autenticado con soporte multitenant
- **Permisos**: `UPDATE_OWN_SETTINGS`
- **Headers Requeridos**:
  - `Authorization`: Bearer token JWT (el patient_id se extrae automáticamente del token)
  - `Content-Type`: application/json
- **Características especiales**:

  - ✅ **ID automático**: El patient_id se obtiene del JWT token, no requiere parámetros
  - ✅ **Actualizaciones parciales**: Soporte para `Partial<MedicalPatientDto>`
  - ✅ **Transacciones atómicas**: Garantiza consistencia en las actualizaciones
  - ✅ **Flexibilidad**: Permite actualizar datos de usuario y/o paciente por separado

- **Request Body**: Permite actualizaciones parciales de información personal y médica

  **Ejemplo 1 - Actualizar solo información personal:**

  ```json
  {
    "user": {
      "name": "Juan Carlos",
      "last_name": "Pérez García",
      "phone": "+1234567890",
      "phone_prefix": "+52"
    }
  }
  ```

  **Ejemplo 2 - Actualizar solo información de paciente:**

  ```json
  {
    "patient": {
      "direction": "Nueva Av. Principal 123",
      "city": "Ciudad de México",
      "province": "CDMX",
      "country": "México",
      "postal_code": "12345"
    }
  }
  ```

  **Ejemplo 3 - Actualizar ambos tipos de información:**

  ```json
  {
    "user": {
      "name": "Juan Carlos",
      "phone": "+1234567890"
    },
    "patient": {
      "direction": "Nueva Av. Principal 123",
      "city": "Ciudad de México"
    }
  }
  ```

- **Respuesta exitosa**:

  - **Código**: 200 OK
  - **Contenido**: Mensaje de confirmación

  ```json
  {
    "message": "Perfil actualizado correctamente"
  }
  ```

- **Respuestas de error**:
  - **Código**: 400 Bad Request
    - Datos de actualización inválidos
    - Usuario no autenticado
    - Usuario no es paciente
  - **Código**: 401 Unauthorized
    - Token JWT inválido o faltante
  - **Código**: 403 Forbidden
    - Permisos insuficientes para actualizar configuraciones propias
  - **Código**: 404 Not Found
    - No se encontraron organizaciones asociadas al paciente

### Características de Seguridad (Endpoints Móviles)

Los endpoints móviles implementan las siguientes medidas de seguridad:

- **Autenticación automática**: Extracción del patient_id desde el JWT token
- **Validación de rol**: Solo usuarios con rol `patient` pueden acceder
- **Aislamiento de datos**: Los pacientes solo pueden acceder a sus propios datos
- **Soporte multitenant**: Acceso automático a datos de todas las organizaciones del paciente
- **Permisos granulares**: Diferentes permisos para lectura (`VIEW_OWN_SETTINGS`) y escritura (`UPDATE_OWN_SETTINGS`)

### Integración con Aplicaciones Móviles

Estos endpoints están específicamente diseñados para:

1. **Pantallas de perfil**: Mostrar información completa del paciente
2. **Formularios de edición**: Actualizar información personal
3. **Historial médico**: Visualizar eventos y medicaciones
4. **Archivos médicos**: Acceder a estudios y documentos
5. **Signos vitales**: Ver últimas mediciones

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
- Los endpoints móviles específicos están etiquetados como `Mobile - Patient Profile` en Swagger.
- Todas las operaciones requieren autenticación mediante JWT.
- El sistema utiliza un modelo multi-tenant, por lo que es necesario especificar el tenant-id en todas las operaciones (excepto endpoints móviles que lo manejan automáticamente).
- Al crear un paciente, se genera automáticamente una contraseña y se envía por correo electrónico al usuario.
- Los pacientes son usuarios con el rol `patient` en el sistema.
- Cada paciente puede estar asociado a múltiples tenants a través de la tabla `patient_tenant`.
- El sistema implementa paginación para las consultas de listado de pacientes.
- **Los endpoints móviles** (`/patient/my-profile`) están optimizados para aplicaciones móviles y manejan automáticamente la funcionalidad multitenant sin requerir headers de tenant-id explícitos.
