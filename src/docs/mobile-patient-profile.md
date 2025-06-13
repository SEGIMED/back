# Mobile Patient Profile API

## Descripción General

La API de Perfil de Paciente Móvil proporciona endpoints específicamente diseñados para aplicaciones móviles que permiten a los pacientes autenticados gestionar su información personal de manera segura y eficiente.

## Características Principales

### 🔐 Autenticación y Autorización

- **JWT Authentication**: Todos los endpoints requieren token JWT válido
- **Role Validation**: Verificación automática de rol de paciente
- **Permission-Based Access**: Permisos específicos por operación
  - `VIEW_OWN_SETTINGS`: Para consultar perfil propio
  - `UPDATE_OWN_SETTINGS`: Para actualizar perfil propio

### 🏢 Funcionalidad Multitenant

- **Acceso Universal**: Obtiene datos de todas las organizaciones del paciente
- **Optimización JWT**: Utiliza información de tenants del token cuando está disponible
- **Fallback Inteligente**: Consulta base de datos si no hay tenants en JWT
- **Consolidación de Datos**: Unifica información médica de múltiples organizaciones

### 📱 Optimizaciones Móviles

- **Responses Optimizados**: Estructura de datos adaptada para consumo móvil
- **Actualizaciones Parciales**: Soporte para `Partial<MedicalPatientDto>`
- **Validaciones Automáticas**: Verificación de usuario y permisos
- **Manejo de Errores**: Mensajes específicos para aplicaciones móviles

## Endpoints

### GET `/patient/my-profile`

Obtiene el perfil completo del paciente autenticado incluyendo datos de todas sus organizaciones.

#### Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
```

#### Respuesta Exitosa (200 OK)

```json
{
  "id": "uuid-patient",
  "name": "Juan",
  "last_name": "Pérez",
  "image": "https://example.com/patient.jpg",
  "age": 35,
  "birth_date": "1989-01-15T00:00:00Z",
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

#### Casos de Error

**400 Bad Request - Usuario no autenticado**

```json
{
  "statusCode": 400,
  "message": "Usuario no autenticado",
  "error": "Bad Request"
}
```

**400 Bad Request - Usuario no es paciente**

```json
{
  "statusCode": 400,
  "message": "Esta funcionalidad es solo para pacientes",
  "error": "Bad Request"
}
```

**404 Not Found - Sin organizaciones**

```json
{
  "statusCode": 404,
  "message": "No se encontraron organizaciones asociadas al paciente",
  "error": "Not Found"
}
```

### PATCH `/patient/my-profile`

Actualiza el perfil del paciente autenticado con soporte para actualizaciones parciales.

#### Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Body de Solicitud

**Actualizar solo información personal:**

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

**Actualizar solo información de paciente:**

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

**Actualizar ambos tipos de información:**

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

#### Respuesta Exitosa (200 OK)

```json
{
  "message": "Perfil actualizado correctamente"
}
```

#### Casos de Error

**400 Bad Request - Datos inválidos**

```json
{
  "statusCode": 400,
  "message": "Datos de actualización inválidos",
  "error": "Bad Request"
}
```

**400 Bad Request - Usuario no es paciente**

```json
{
  "statusCode": 400,
  "message": "Esta funcionalidad es solo para pacientes",
  "error": "Bad Request"
}
```

## Arquitectura y Flujo de Datos

### Flujo de Autenticación

1. **Verificación JWT**: Extrae `user.id` y `user.role` del token
2. **Validación de Rol**: Confirma que `user.role === 'patient'`
3. **Extracción de Tenants**: Obtiene `userTenants` del JWT para optimización

### Flujo Multitenant

1. **Optimización JWT**: Usa tenants del token si están disponibles
2. **Fallback DB**: Consulta `patient_tenant` si no hay tenants en JWT
3. **Agregación de Datos**: Consulta todas las organizaciones del paciente
4. **Consolidación**: Unifica datos médicos de múltiples fuentes

### Seguridad y Validaciones

- **Verificación de Identidad**: Usuario debe estar autenticado
- **Validación de Rol**: Solo pacientes pueden acceder
- **Permisos Granulares**: Diferentes permisos para lectura/escritura
- **Aislamiento de Datos**: Solo acceso a datos propios del paciente

## Integración con Frontend Móvil

### Uso Recomendado

**Obtener perfil al iniciar sesión:**

```javascript
const fetchProfile = async () => {
  try {
    const response = await fetch('/patient/my-profile', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};
```

**Actualizar información personal:**

```javascript
const updateProfile = async (updateData) => {
  try {
    const response = await fetch('/patient/my-profile', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

### Manejo de Estados de Carga

**Estados recomendados para UI móvil:**

- `loading`: Durante la carga inicial del perfil
- `updating`: Durante actualizaciones del perfil
- `error`: Para manejar errores de red o validación
- `success`: Confirmación de actualizaciones exitosas

### Casos de Uso Principales

1. **Pantalla de Perfil**: Mostrar información completa del paciente
2. **Edición de Datos**: Formularios para actualizar información personal
3. **Historial Médico**: Visualización de eventos y medicaciones
4. **Archivos Médicos**: Acceso a estudios y documentos
5. **Signos Vitales**: Últimas mediciones del paciente

## Consideraciones de Rendimiento

### Optimizaciones Implementadas

- **Queries Paralelas**: Uso de `Promise.all()` para consultas simultáneas
- **Cache de Tenants**: Aprovecha información del JWT para evitar consultas
- **Datos Consolidados**: Una sola respuesta con toda la información necesaria
- **Actualizaciones Atómicas**: Transacciones para garantizar consistencia

### Recomendaciones de Uso

- **Cachear en Cliente**: Almacenar perfil localmente para uso offline
- **Actualizaciones Incrementales**: Usar PATCH solo con campos modificados
- **Manejo de Errores**: Implementar retry logic para fallos de red
- **Validación Local**: Pre-validar datos antes de enviar al servidor

## Testing y Validación

### Casos de Prueba Recomendados

**Autenticación:**

- Token válido con rol de paciente
- Token inválido o expirado
- Usuario sin rol de paciente
- Usuario sin token

**Funcionalidad Multitenant:**

- Paciente con múltiples organizaciones
- Paciente con una sola organización
- Paciente sin organizaciones asociadas
- Tenants en JWT vs consulta de DB

**Actualizaciones:**

- Actualización solo de datos de usuario
- Actualización solo de datos de paciente
- Actualización de ambos tipos de datos
- Datos inválidos o incompletos

**Casos Edge:**

- Paciente sin datos médicos
- Perfil con información mínima
- Errores de base de datos
- Timeouts de red

## Changelog

### v1.0.0 (Implementación Inicial)

- ✅ Endpoint GET `/patient/my-profile`
- ✅ Endpoint PATCH `/patient/my-profile`
- ✅ Soporte multitenant completo
- ✅ Autenticación y autorización JWT
- ✅ Documentación Swagger completa
- ✅ DTOs específicos para respuestas móviles
- ✅ Validaciones y manejo de errores
- ✅ Optimizaciones de rendimiento
