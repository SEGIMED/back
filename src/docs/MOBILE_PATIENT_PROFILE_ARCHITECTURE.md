# Mobile Patient Profile - Documentación Técnica General

## Visión General

La implementación de los endpoints móviles para el perfil de pacientes representa una expansión significativa de la plataforma SEGIMED, proporcionando a los pacientes acceso directo y seguro a su información médica consolidada desde aplicaciones móviles.

## Arquitectura de la Solución

### 🏗️ Diseño de Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │────│   API Gateway    │────│   SEGIMED API   │
│   (Patient)     │    │   (JWT Auth)     │    │   (NestJS)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                               ┌─────────────────────────┼─────────────────────────┐
                               │                         │                         │
                    ┌──────────▼─────────┐    ┌─────────▼────────┐    ┌──────────▼─────────┐
                    │   Patient Service  │    │   Auth Service   │    │  Database Layer   │
                    │   (Business Logic) │    │   (Permissions)  │    │   (Prisma ORM)    │
                    └────────────────────┘    └──────────────────┘    └────────────────────┘
                                                         │
                              ┌─────────────────────────┼─────────────────────────┐
                              │                         │                         │
                   ┌──────────▼────────┐    ┌──────────▼──────────┐    ┌──────────▼─────────┐
                   │   Tenant A DB     │    │   Tenant B DB       │    │   Global Data      │
                   │   (Org Medical)   │    │   (Clinic Data)     │    │   (User Profile)   │
                   └───────────────────┘    └─────────────────────┘    └────────────────────┘
```

### 🔄 Flujo de Datos Multitenant

1. **Autenticación**: Mobile app envía JWT token
2. **Extracción**: API extrae patient_id y tenants del token
3. **Discovery**: Sistema identifica todas las organizaciones del paciente
4. **Consolidación**: Datos médicos se obtienen de múltiples tenants
5. **Unificación**: Respuesta única con información consolidada
6. **Entrega**: App móvil recibe perfil completo unificado

## Componentes Principales

### 📱 Endpoints Móviles

#### `GET /patient/my-profile`

**Propósito**: Obtener perfil completo del paciente autenticado

**Características técnicas**:

- **Autenticación**: JWT automática con extracción de patient_id
- **Multitenant**: Acceso a datos de todas las organizaciones
- **Consolidación**: Unifica signos vitales, archivos, medicación, eventos
- **Optimización**: Queries paralelas con `Promise.all()`

**Flujo de procesamiento**:

```typescript
1. Validar JWT y extraer patient_id
2. Obtener tenant_ids (JWT o DB)
3. Ejecutar queries paralelas:
   - Usuario base
   - Paciente por tenant
   - Signos vitales consolidados
   - Archivos médicos
   - Evaluaciones y antecedentes
   - Medicación activa
   - Eventos futuros y pasados
4. Consolidar y estructurar respuesta
5. Retornar GetPatientDto
```

#### `PATCH /patient/my-profile`

**Propósito**: Actualizar perfil del paciente de forma segura

**Características técnicas**:

- **Actualizaciones atómicas**: Transacciones con `$transaction()`
- **Flexibilidad**: Soporte para `Partial<MedicalPatientDto>`
- **Validación**: Verificación de ownership y permisos
- **Separación**: Datos de usuario vs datos de paciente

**Flujo de procesamiento**:

```typescript
1. Validar JWT y datos de entrada
2. Verificar ownership del paciente
3. Iniciar transacción atómica:
   - Actualizar tabla User (si hay datos)
   - Actualizar tabla Patient (si hay datos)
4. Confirmar transacción
5. Retornar confirmación
```

### 🛡️ Sistema de Permisos

#### Nuevos Permisos Implementados

```typescript
Permission.VIEW_OWN_SETTINGS; // Ver propio perfil
Permission.UPDATE_OWN_SETTINGS; // Actualizar propio perfil
```

#### Rol Patient Actualizado

El rol de paciente ahora incluye permisos específicos para autogestión:

```typescript
const patientPermissions = [
  Permission.VIEW_OWN_APPOINTMENTS,
  Permission.SCHEDULE_OWN_APPOINTMENT,
  Permission.VIEW_OWN_MEDICAL_RECORDS,
  Permission.SUBMIT_SELF_EVALUATION,
  Permission.VIEW_PATIENT_DETAILS,
  Permission.VIEW_MEDICAL_ORDERS,
  Permission.VIEW_TREATMENT_HISTORY,
  Permission.VIEW_DOCTORS_LIST,
  Permission.VIEW_DOCTOR_DETAILS,
  Permission.VIEW_OWN_VITAL_SIGNS,
  Permission.REGISTER_OWN_VITAL_SIGNS,
  Permission.VIEW_OWN_PRESCRIPTIONS,
  Permission.VIEW_OWN_MEDICAL_EVENTS,
  Permission.VIEW_OWN_SETTINGS, // 🆕 NUEVO
  Permission.UPDATE_OWN_SETTINGS, // 🆕 NUEVO
];
```

### 🏢 Implementación Multitenant

#### Estrategia de Tenant Discovery

```typescript
async getPatientTenantIds(patientId: string, userTenants?: TenantInfo[]): Promise<string[]> {
  // 1. Priorizar tenants del JWT si existen
  if (userTenants && userTenants.length > 0) {
    return userTenants.map(t => t.id);
  }

  // 2. Fallback: consultar base de datos
  const patientTenants = await this.prisma.patient_tenant.findMany({
    where: { patient_id: patientId },
    select: { tenant_id: true }
  });

  return patientTenants.map(pt => pt.tenant_id);
}
```

#### Queries Multitenant Optimizadas

```typescript
// Ejemplo: Obtener signos vitales de todos los tenants
const vitalSigns = await this.prisma.vital_sign.findMany({
  where: {
    patient_id: patientId,
    tenant_id: { in: tenantIds }, // 🔑 Clave multitenant
  },
  include: {
    vital_sign_measure_unit: true,
    vital_sign_catalog: true,
  },
});
```

## 📊 Lógica de Negocio

### Consolidación de Signos Vitales

**Prioridad**: Eventos médicos > Autoevaluaciones

```typescript
// 1. Buscar en medical_event_vital_sign (mayor prioridad)
// 2. Buscar en self_evaluation_event_vital_sign (menor prioridad)
// 3. Consolidar evitando duplicados
```

### Eventos Médicos

**Separación automática**: Futuros vs Pasados

```typescript
const now = new Date();
const futureEvents = medicalEvents.filter(
  (event) => new Date(event.start_date) > now,
);
const pastEvents = medicalEvents.filter(
  (event) => new Date(event.start_date) <= now,
);
```

### Medicación Activa

**Filtrado**: Solo medicamentos con `active: true`

```typescript
const activeMedications = prescriptions.filter(
  (prescription) => prescription.active === true,
);
```

## 🔐 Seguridad Implementada

### Validaciones Automáticas

1. **JWT Validation**: Token válido y no expirado
2. **Role Check**: Usuario debe tener rol 'patient'
3. **Ownership**: Solo acceso a datos propios
4. **Permission Check**: Permisos específicos por endpoint

### Protecciones de Datos

- **No exposición de IDs**: Patient ID extraído del JWT, no de parámetros
- **Tenant Isolation**: Acceso solo a tenants autorizados
- **Data Filtering**: Solo datos del paciente autenticado

## 📱 Optimizaciones Móviles

### Estructura de Respuesta Optimizada

```typescript
interface PatientProfileMobileResponseDto {
  // Datos básicos del paciente
  id: string;
  name: string;
  last_name: string;
  age: number;

  // Información médica consolidada
  vital_signs: VitalSignMobileDto[];
  files: FileMobileDto[];
  current_medication: MedicationMobileDto[];

  // Eventos separados por temporalidad
  future_medical_events: MedicalEventMobileDto[];
  past_medical_events: MedicalEventMobileDto[];
}
```

### Performance Optimizations

- **Parallel Queries**: `Promise.all()` para queries simultáneas
- **Selective Loading**: Solo campos necesarios para móvil
- **Efficient Joins**: Includes optimizados en Prisma
- **Memory Management**: Procesamiento por chunks para datasets grandes

## 📚 Documentación Generada

### Swagger/OpenAPI

- **Tag específico**: "Mobile - Patient Profile"
- **Documentación completa** en español
- **Ejemplos prácticos** de requests/responses
- **Casos de error** documentados
- **Múltiples escenarios** de uso

### Guías Técnicas

1. **`mobile-patient-profile.md`**: API de perfil móvil
2. **`SWAGGER_MOBILE_PATIENT_PROFILE.md`**: Documentación Swagger
3. **`MOBILE_PATIENT_PROFILE_CHANGELOG.md`**: Historial de cambios
4. **README.md actualizado**: Enlaces y endpoints nuevos

## 🧪 Testing Recomendado

### Casos de Prueba Críticos

#### Autenticación y Autorización

```typescript
describe('Mobile Patient Profile Authentication', () => {
  test('should reject requests without JWT');
  test('should reject non-patient users');
  test('should validate permission VIEW_OWN_SETTINGS');
  test('should validate permission UPDATE_OWN_SETTINGS');
});
```

#### Funcionalidad Multitenant

```typescript
describe('Multitenant Functionality', () => {
  test('should consolidate data from multiple tenants');
  test('should handle JWT tenants priority');
  test('should fallback to DB tenant discovery');
  test('should isolate data by patient ownership');
});
```

#### Lógica de Negocio

```typescript
describe('Business Logic', () => {
  test('should prioritize medical event vital signs');
  test('should separate future vs past medical events');
  test('should filter only active medications');
  test('should handle partial profile updates');
});
```

## 📈 Métricas y Monitoreo

### KPIs Recomendados

- **Response Time**: Tiempo de respuesta de endpoints móviles
- **Error Rate**: Tasa de errores por tipo (auth, validation, etc.)
- **Usage Patterns**: Frecuencia de uso por endpoint
- **Data Volume**: Cantidad de datos consolidados por paciente

### Logging Estratégico

```typescript
// Logs de negocio importantes
logger.info('Patient profile accessed', { patientId, tenantCount });
logger.info('Profile updated', { patientId, fieldsUpdated });
logger.warn('Fallback tenant discovery used', { patientId });
logger.error('Profile consolidation failed', { patientId, error });
```

## 🚀 Roadmap Futuro

### Mejoras Planificadas

1. **Caching**: Redis para perfiles frecuentemente accedidos
2. **Real-time**: WebSocket para actualizaciones en tiempo real
3. **Analytics**: Dashboard de uso de perfil móvil
4. **Internationalization**: Soporte multi-idioma

### Integraciones Potenciales

- **Push Notifications**: Notificaciones de cambios en perfil
- **Offline Sync**: Capacidad de trabajo offline
- **Biometric Auth**: Autenticación biométrica móvil
- **Voice Interface**: Comando de voz para actualizaciones

## 📞 Soporte y Mantenimiento

### Contactos Técnicos

- **Team Lead**: Equipo de desarrollo SEGIMED
- **Architecture**: Architects team
- **Mobile Team**: Desarrollo móvil
- **DevOps**: Infraestructura y deployment

### Recursos Adicionales

- [Documentación API completa](../README.md)
- [Guía Multitenant](MULTITENANT_GUIDE.md)
- [Swagger UI](http://localhost:3000/api)
- [Repositorio del proyecto](https://github.com/segimed/back)

---

**Documento**: Mobile Patient Profile - Documentación Técnica General  
**Versión**: 1.0.0  
**Fecha**: June 13, 2025  
**Estado**: Documentación Completa
