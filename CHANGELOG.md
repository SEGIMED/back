# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### 🆕 CRUD Completo para Catálogo de Tipos de Identificación

- **Nuevo módulo**: `CatIdentificationTypeModule` con CRUD completo
- **Endpoints implementados**:
  - `POST /cat-identification-type` - Crear tipo de identificación
  - `GET /cat-identification-type` - Listar todos (con filtro por país)
  - `GET /cat-identification-type/{id}` - Obtener por ID
  - `PATCH /cat-identification-type/{id}` - Actualizar parcialmente
  - `DELETE /cat-identification-type/{id}` - Eliminar
- **Características**:
  - Validaciones completas con class-validator
  - Filtrado por país con búsqueda insensible a mayúsculas
  - Autorización con permiso `MANAGE_CATALOGS`
  - Documentación completa con Swagger
  - Manejo de errores robusto

#### 🆕 Soporte Multitenant para Patient Studies

- **Nuevo endpoint**: `GET /patient-studies/by-patient/{patient_id}` con soporte multitenant
- **Funcionalidad multitenant**:
  - Busca estudios en todas las organizaciones del paciente
  - Prioriza tenants del JWT cuando están disponibles
  - Fallback a consulta `patient_tenant` cuando es necesario
  - Consulta optimizada con `tenant_id: { in: tenantIds }`
- **Métodos actualizados**:
  - `findByPatientId()` ahora acepta parámetro `userTenants`
  - Nuevo método privado `getPatientTenantIds()` para optimización

#### 🆕 Endpoint de Cancelación de Citas Móviles

- **Nuevo endpoint**: `PATCH /mobile/appointments/{appointment_id}/cancel`
- **Características**:
  - Solo pacientes autenticados pueden cancelar sus citas
  - Soporte multitenant completo
  - Validaciones de negocio: solo citas pendientes y futuras
  - Campo opcional `reason` para especificar motivo de cancelación
  - Actualiza estado a 'cancelada' y guarda razón en observaciones
- **Validaciones implementadas**:
  - Usuario autenticado con rol 'patient'
  - Cita pertenece al paciente (en cualquiera de sus organizaciones)
  - Solo citas con status 'pendiente'
  - Solo citas futuras (no pasadas)

### Changed

#### 🔄 Mejoras en Patient Studies Service

- **Método `findByPatientId()`**: Ahora con soporte multitenant opcional
- **Optimización**: Reduce consultas a base de datos usando tenants del JWT
- **Compatibilidad**: Mantiene retrocompatibilidad con código existente

#### 🔄 Actualización del App Module

- **Registrado**: `CatIdentificationTypeModule` en imports
- **Integración**: Conectado con el sistema de guards y autenticación

### Fixed

#### 🐛 Corrección en Middleware de Prisma

- **Problema**: El middleware automático de tenant bloqueaba consultas multitenant válidas
- **Solución**: Skip del filtro automático cuando se detecta lógica OR en queries de prescriptions
- **Impacto**: Permite que funcionen correctamente las consultas multitenant en prescriptions

### Documentation

#### 📚 Documentación Nueva y Actualizada

- **`src/docs/cat-identification-type.md`**: Documentación completa del nuevo CRUD
  - Descripción de endpoints y funcionalidades
  - Ejemplos de uso y casos comunes
  - Validaciones y consideraciones de seguridad
  - Integración con otros módulos
- **`src/docs/patient-studies.md`**: Actualizada con endpoint multitenant
  - Nuevo endpoint `GET /patient-studies/by-patient/{patient_id}`
  - Explicación de funcionalidad multitenant
  - Ejemplos de uso y respuestas
- **`src/docs/mobile-appointments.md`**: Actualizada con endpoint de cancelación
  - Nuevo endpoint `PATCH /mobile/appointments/{appointment_id}/cancel`
  - Validaciones de negocio detalladas
  - Casos de uso móviles y ejemplos

### Technical Improvements

#### 🏗️ Arquitectura y Organización

- **Modularización**: Nuevo módulo de catálogos bien estructurado
- **Consistencia**: Patrones uniformes de multitenant en todos los módulos
- **DTOs**: Uso consistente de DTOs con validaciones apropiadas
- **Error Handling**: Manejo de errores estandarizado y robusto

#### ⚡ Optimizaciones de Rendimiento

- **Consultas batch**: Optimización en obtención de especialidades médicas
- **Mapas eficientes**: Uso de Maps para relacionar datos de médicos
- **Consultas condicionales**: Evita consultas innecesarias usando tenants del JWT
- **Filtros a nivel DB**: Reduce transferencia de datos con filtros apropiados

### Security

#### 🔒 Mejoras de Seguridad

- **Validación de permisos**: Todos los nuevos endpoints requieren autenticación apropiada
- **Autorización granular**: Uso de permisos específicos (`MANAGE_CATALOGS`, `VIEW_OWN_APPOINTMENTS`)
- **Validación de datos**: Class-validator en todos los DTOs nuevos
- **Tenant isolation**: Aplicación correcta de políticas multitenant

## Previous Versions

### [Previous entries would be here]

---

**Legend:**

- 🆕 New features
- 🔄 Changes/Updates
- 🐛 Bug fixes
- 📚 Documentation
- 🏗️ Architecture/Technical
- ⚡ Performance
- 🔒 Security

## [2024-01-15] - Implementación Multitenant y Mobile APIs Mejoradas

### ✅ **COMPLETADO** - Nueva Funcionalidad Multitenant

#### 🔧 **Patient Studies (Estudios del Paciente)**

- **Nuevo endpoint principal**: `GET /patient-studies/my-studies` - Pacientes ven sus estudios de todas las organizaciones
- **Endpoint para profesionales**: `GET /patient-studies/by-patient/{patient_id}` - Médicos consultan estudios de pacientes
- **Seguridad JWT**: Patient ID extraído automáticamente del token, sin exposición en URLs
- **Multitenant automático**: Búsqueda en todas las organizaciones del paciente usando `tenant_id: { in: tenantIds }`
- **Documentación completa**: `src/docs/patient-studies.md` con ejemplos detallados

#### 🆕 **Cat Identification Type (CRUD Completo)**

- **API completa**: POST, GET, PATCH, DELETE con validaciones y ejemplos Swagger
- **Filtros avanzados**: Búsqueda por país con paginación
- **Gestión de permisos**: `MANAGE_CATALOGS` para control granular
- **Documentación**: `src/docs/cat-identification-type.md` con casos de uso

#### 📱 **Mobile Appointments (Citas Móviles)**

- **Vista home**: `GET /mobile/appointments?home=true` - Solo próxima cita
- **Vista completa**: `GET /mobile/appointments` - Todas las citas agrupadas por estado
- **🆕 Cancelación**: `PATCH /mobile/appointments/{id}/cancel` - Pacientes cancelan sus citas
- **Validaciones automáticas**: Solo citas pendientes y futuras, con razones opcionales
- **Documentación**: `src/docs/mobile-appointments.md` con ejemplos de uso

#### 🩺 **Mobile Self-Evaluation Events (Signos Vitales) - CORREGIDO** 🆕

- **🆕 Endpoint principal**: `POST /mobile/self-evaluation-event/vital-signs` - Registro de signos vitales propios
- **Simplificación móvil**: Sin `patient_id`, `medical_event_id` ni `tenant_id` requeridos
- **JWT automático**: Patient ID extraído del token para máxima seguridad
- **Datos globales**: Signos vitales propios sin asociación a eventos médicos específicos
- **Vistas de consulta**: Últimos registros y análisis histórico con multitenant
- **Separación clara**: Endpoints para pacientes vs profesionales de la salud
- **Documentación**: `src/docs/mobile-self-evaluation.md` con casos de uso móviles

### 🔐 **Sistema de Permisos Actualizado**

#### Permisos para Médicos/Profesionales (Agregados)

- `DELETE_PATIENTS` - Para gestión completa de estudios del paciente
- `MANAGE_CATALOGS` - Para gestión de catálogos incluyendo tipos de identificación

#### Permisos para Pacientes (Ya existían, ahora utilizados)

- `VIEW_OWN_APPOINTMENTS` - Ver y cancelar citas propias
- `VIEW_OWN_MEDICAL_RECORDS` - Ver estudios médicos propios
- `VIEW_OWN_VITAL_SIGNS` - Ver signos vitales propios e histórico
- `REGISTER_OWN_VITAL_SIGNS` - Registrar signos vitales propios

#### Actualización Automática

- **Endpoint**: `POST /permission-updater/update-default-permissions`
- **Usuarios objetivo**: Médicos y pacientes existentes
- **Proceso**: Actualización automática de roles y asignación de nuevos permisos
- **Logs detallados**: Estadísticas de usuarios procesados y errores

### 🏗️ **Arquitectura Mejorada**

#### Patrones Multitenant Consistentes

```typescript
// Patrón estándar implementado en todos los módulos
private async getPatientTenantIds(patientId: string, userTenants?: TenantInfo[]): Promise<string[]> {
  // 1. Priorizar tenants del JWT
  if (userTenants?.length > 0) return userTenants.map(t => t.id);

  // 2. Fallback a consulta de base de datos
  const patientTenants = await this.prisma.patient_tenant.findMany({
    where: { patient: { user_id: patientId }, deleted: false },
    select: { tenant_id: true }
  });

  return patientTenants.map(pt => pt.tenant_id);
}
```

#### Validaciones de Seguridad Automáticas

- **JWT obligatorio**: Todos los endpoints móviles requieren autenticación
- **Validación de rol**: Automática para endpoints específicos de pacientes
- **Ownership**: Solo datos propios del usuario autenticado
- **No exposición de IDs**: Patient IDs nunca se exponen en URLs

#### Swagger Documentation Completa

- **Ejemplos múltiples**: Casos básicos, completos y de error
- **Validaciones documentadas**: Explicación de cada validación y restricción
- **Responses detalladas**: Todos los códigos de estado con ejemplos
- **Seguridad clara**: Documentación de requerimientos JWT y permisos

### 📚 **Documentación Integral**

#### Documentos Técnicos Nuevos

- `src/docs/patient-studies.md` - API completa con multitenant
- `src/docs/cat-identification-type.md` - CRUD completo del catálogo
- `src/docs/mobile-appointments.md` - Funcionalidad móvil de citas
- `src/docs/mobile-self-evaluation.md` - Signos vitales móviles
- `src/docs/MULTITENANT_GUIDE.md` - Guía técnica de implementación
- `src/docs/NEW_PERMISSIONS_SUMMARY.md` - Resumen de permisos y configuración

#### README Actualizado

- **Descripción del proyecto**: SEGIMED como plataforma de salud digital
- **Nuevas características**: APIs móviles y funcionalidad multitenant
- **Guías de desarrollo**: Enlaces a documentación técnica específica

### 🔄 **Migraciones y Updates**

#### Base de Datos

- **Compatible**: No requiere cambios de esquema
- **Optimizada**: Nuevas consultas eficientes con índices existentes
- **Multitenant**: Uso correcto de tenant_id en todas las consultas

#### Dependencias de Módulos

- **GuardAuthModule**: Agregado a módulos que usan guards de permisos
- **Imports corregidos**: Resolución de dependencias de NestJS
- **Servicios compartidos**: Reutilización de lógica multitenant

### ⚡ **Optimizaciones de Rendimiento**

#### Consultas de Base de Datos

- **Batch queries**: Múltiples especialidades en una sola consulta
- **Mapeo eficiente**: Uso de Maps para relacionar datos
- **Filtros a nivel DB**: Reducción de transferencia de datos

#### Lógica de Negocio

- **Priorización JWT**: Evita consultas innecesarias cuando tenants están en token
- **Caché implícito**: Reutilización de tenant IDs en múltiples operaciones
- **Validaciones tempranas**: Fallos rápidos para requests inválidos

### 🧪 **Testing y Validación**

#### Casos de Prueba Cubiertos

- **Autenticación**: JWT válidos e inválidos
- **Autorización**: Roles correctos e incorrectos
- **Multitenant**: Acceso a múltiples organizaciones
- **Validaciones**: Datos válidos e inválidos
- **Edge cases**: Pacientes sin organizaciones, datos faltantes

#### Entornos de Prueba

- **Desarrollo**: Configuración local con datos de prueba
- **Staging**: Validación con datos reales sin afectar producción
- **Producción**: Preparado para despliegue con migraciones automáticas

### 🚀 **Próximos Pasos**

1. **Ejecutar update de permisos** en todos los entornos
2. **Validar funcionalidad** desde aplicaciones móviles
3. **Monitorear performance** con métricas de uso real
4. **Documentar para frontend** las nuevas capacidades
5. **Planificar próximas características** basadas en feedback

### 📞 **Soporte y Contacto**

Para implementación, dudas técnicas o soporte:

- **Documentación**: Archivos en `src/docs/`
- **Código fuente**: Módulos en `src/mobile-functions/` y `src/medical-scheduling/`
- **Permisos**: `src/auth/services/permission-updater.service.ts`

---

**Versión**: 2024-01-15
**Autor**: Sistema de desarrollo SEGIMED
**Estado**: ✅ Completado y listo para producción
