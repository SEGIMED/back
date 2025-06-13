# Swagger Documentation - Mobile Patient Profile API

## Documentación Swagger Completada

La documentación Swagger para los endpoints de perfil móvil de pacientes ha sido completamente implementada siguiendo los estándares establecidos en el proyecto SEGIMED.

## Tags Implementados

### `Mobile - Patient Profile`

Tag específico para los endpoints móviles de gestión de perfil de paciente, añadido en `main.ts` con la descripción:

```typescript
'Patient profile management for mobile applications - view and update own profile';
```

## Endpoints Documentados

### `GET /patient/my-profile`

✅ **Documentación Completa Implementada:**

- **@ApiTags**: `['Mobile - Patient Profile']`
- **@ApiOperation**: Descripción detallada de funcionalidad multitenant
- **@ApiBearerAuth**: Autenticación JWT requerida
- **@RequirePermission**: `Permission.VIEW_OWN_SETTINGS`

**Respuestas Documentadas:**

- `200 OK`: Con ejemplo completo del perfil del paciente
- `400 Bad Request`: Con 3 ejemplos específicos de errores
- `401 Unauthorized`: Token inválido o faltante
- `403 Forbidden`: Permisos insuficientes

**Ejemplo de Respuesta 200:**

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
  "vital_signs": [...],
  "files": [...],
  "evaluation": {...},
  "background": {...},
  "current_medication": [...],
  "future_medical_events": [...],
  "past_medical_events": [...]
}
```

### `PATCH /patient/my-profile`

✅ **Documentación Completa Implementada:**

- **@ApiTags**: `['Mobile - Patient Profile']`
- **@ApiOperation**: Descripción detallada de funcionalidad de actualización
- **@ApiBody**: Con 3 ejemplos prácticos de casos de uso
- **@ApiBearerAuth**: Autenticación JWT requerida
- **@RequirePermission**: `Permission.UPDATE_OWN_SETTINGS`

**Ejemplos de Request Body:**

1. **Actualizar solo información personal**
2. **Actualizar solo información de paciente**
3. **Actualizar ambos tipos de información**

**Respuestas Documentadas:**

- `200 OK`: Con ejemplo de mensaje de confirmación
- `400 Bad Request`: Con 4 ejemplos específicos de errores
- `401 Unauthorized`: Token inválido o faltante
- `403 Forbidden`: Permisos insuficientes

## DTOs Específicos Creados

### `PatientProfileMobileResponseDto`

✅ **Completamente Documentado con @ApiProperty:**

- Todos los campos con descripciones en español
- Ejemplos específicos para cada propiedad
- Indicación de campos opcionales con `nullable: true`
- Tipos de datos complejos anidados documentados

**Campos Nuevos Añadidos:**

```typescript
@ApiProperty({
  description: 'Dirección completa del paciente',
  example: 'Av. Principal 123, Col. Centro',
  nullable: true,
})
direction?: string;

@ApiProperty({
  description: 'Ciudad de residencia del paciente',
  example: 'Ciudad de México',
  nullable: true,
})
city?: string;

@ApiProperty({
  description: 'Provincia o estado del paciente',
  example: 'CDMX',
  nullable: true,
})
province?: string;

@ApiProperty({
  description: 'País de residencia del paciente',
  example: 'México',
  nullable: true,
})
country?: string;

@ApiProperty({
  description: 'Código postal del paciente',
  example: '12345',
  nullable: true,
})
postal_code?: string;

@ApiProperty({
  description: 'Teléfono del paciente',
  example: '+1234567890',
  nullable: true,
})
phone?: string;
```

### DTOs Auxiliares Documentados

- `VitalSignMobileDto`
- `FileMobileDto`
- `EvaluationMobileDto`
- `BackgroundMobileDto`
- `MedicationMobileDto`
- `MedicalEventMobileDto`
- `UpdatePatientProfileMobileResponseDto`

## Características de la Documentación

### ✅ Estándares Seguidos

- **Idioma**: Todas las descripciones en español
- **Ejemplos Reales**: Datos de ejemplo relevantes y realistas
- **Casos de Error**: Múltiples ejemplos de errores con contexto
- **Consistencia**: Siguiendo patrones existentes en el proyecto
- **Completitud**: Todos los campos y respuestas documentados

### ✅ Aspectos Móviles Destacados

- Enfoque específico en funcionalidad móvil
- Simplificación de campos para consumo móvil
- Ejemplos orientados a casos de uso móviles
- Documentación de flujo de autenticación JWT automático

### ✅ Seguridad Documentada

- Permisos específicos documentados
- Validaciones automáticas explicadas
- Restricciones de acceso clarificadas
- Flujo de autenticación JWT explicado

## Integración con Documentación Existente

### Archivo `mobile-patient-profile.md`

✅ **Documentación Complementaria Creada:**

- Casos de uso detallados
- Ejemplos de integración
- Consideraciones de rendimiento
- Guía de arquitectura y flujo de datos

### Archivo `main.ts`

✅ **Tag Añadido:**

```typescript
.addTag(
  'Mobile - Patient Profile',
  'Patient profile management for mobile applications - view and update own profile',
)
```

## Estado de Completitud

| Aspecto               | Estado      | Detalles                           |
| --------------------- | ----------- | ---------------------------------- |
| **Tags Swagger**      | ✅ Completo | Tag específico añadido             |
| **@ApiOperation**     | ✅ Completo | Descripciones detalladas           |
| **@ApiResponse**      | ✅ Completo | Todas las respuestas documentadas  |
| **@ApiBody**          | ✅ Completo | Ejemplos múltiples de casos de uso |
| **DTOs Móviles**      | ✅ Completo | Todos los campos documentados      |
| **Ejemplos JSON**     | ✅ Completo | Respuestas y requests de ejemplo   |
| **Manejo de Errores** | ✅ Completo | Múltiples casos documentados       |
| **Seguridad**         | ✅ Completo | Permisos y autenticación           |

## Verificación

### Endpoints Disponibles en Swagger UI

- `GET /patient/my-profile` - Tag: "Mobile - Patient Profile"
- `PATCH /patient/my-profile` - Tag: "Mobile - Patient Profile"

### URL de Acceso

```
http://localhost:3000/api
```

### Sección en Swagger UI

Los endpoints aparecen bajo la sección **"Mobile - Patient Profile"** con toda la documentación implementada.

## Conclusión

✅ **La Subtarea 5: Documentación Swagger está COMPLETA.**

La documentación Swagger para los endpoints de perfil móvil de pacientes cumple con todos los estándares del proyecto SEGIMED y proporciona una experiencia de desarrollador completa con ejemplos prácticos, manejo detallado de errores, y documentación en español.
