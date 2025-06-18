# 📚 Índice de Documentación - Mobile Patient Profile

## Documentación Completa Generada

Este índice enlaza toda la documentación creada y actualizada para la implementación de los endpoints móviles de perfil de pacientes.

## 📋 Documentos Principales

### 🚀 Documentación de API

1. **[Mobile Patient Profile API](mobile-patient-profile.md)**

   - Guía completa de la API móvil
   - Casos de uso y ejemplos
   - Integración con frontend móvil

2. **[Swagger Documentation Report](SWAGGER_MOBILE_PATIENT_PROFILE.md)**
   - Documentación específica de Swagger
   - DTOs y ejemplos JSON
   - Casos de error documentados

### 🏗️ Arquitectura y Diseño

3. **[Mobile Patient Profile Architecture](MOBILE_PATIENT_PROFILE_ARCHITECTURE.md)**

   - Diseño de sistema completo
   - Flujo de datos multitenant
   - Componentes técnicos detallados

4. **[Implementation Changelog](MOBILE_PATIENT_PROFILE_CHANGELOG.md)**
   - Resumen completo de la implementación
   - Archivos modificados y creados
   - Estado de completitud

### 🔐 Permisos y Seguridad

5. **[New Permissions Summary](NEW_PERMISSIONS_SUMMARY.md)** _(Actualizado)_

   - Nuevos permisos: `VIEW_OWN_SETTINGS`, `UPDATE_OWN_SETTINGS`
   - Configuración en roles
   - Tabla completa de endpoints y permisos

6. **[Swagger Documentation Report](SWAGGER_DOCUMENTATION_REPORT.md)** _(Actualizado)_
   - Estadísticas actualizadas: 100% documentado
   - Endpoints móviles incluidos
   - Completitud de documentación

### 📱 Documentación General

7. **[README.md](../README.md)** _(Actualizado)_
   - Nuevos endpoints en listado principal
   - Enlaces a documentación técnica
   - Sección de Mobile APIs actualizada

## 📁 Archivos de Código Documentados

### 🔧 Servicios y Controladores

```
src/management/patient/patient.service.ts
├── findMyProfile() - Obtener perfil con multitenant
├── updateMyProfile() - Actualizar perfil atómico
└── getPatientTenantIds() - Helper para tenant discovery

src/management/patient/patient.controller.ts
├── GET /patient/my-profile - Endpoint móvil de consulta
└── PATCH /patient/my-profile - Endpoint móvil de actualización
```

### 🛡️ Autenticación y Permisos

```
src/auth/roles/user-role-manager.service.ts
└── ensurePatientRoleExists() - Rol Patient con nuevos permisos

src/auth/permissions/permission.enum.ts
├── VIEW_OWN_SETTINGS - Nuevo permiso de consulta
└── UPDATE_OWN_SETTINGS - Nuevo permiso de actualización
```

### 📦 DTOs y Tipos

```
src/management/patient/dto/mobile-patient-profile-response.dto.ts
├── PatientProfileMobileResponseDto - Respuesta completa
├── UpdatePatientProfileMobileResponseDto - Respuesta de actualización
├── VitalSignMobileDto - Signos vitales móvil
├── FileMobileDto - Archivos médicos móvil
├── EvaluationMobileDto - Evaluaciones móvil
├── BackgroundMobileDto - Antecedentes móvil
├── MedicationMobileDto - Medicamentos móvil
└── MedicalEventMobileDto - Eventos médicos móvil
```

### ⚙️ Configuración

```
src/main.ts
└── Mobile - Patient Profile tag - Configuración Swagger

src/services/appointment-scheduler/appointment-scheduler.module.ts
└── GuardAuthModule - Corrección de dependencias
```

## 🎯 Estructura de Documentación

### Por Audiencia

#### 👨‍💻 Desarrolladores Frontend/Móvil

- **Primario**: [Mobile Patient Profile API](mobile-patient-profile.md)
- **Swagger**: [Documentación Swagger](SWAGGER_MOBILE_PATIENT_PROFILE.md)
- **Ejemplos**: Casos de uso en README.md

#### 🏗️ Arquitectos y Tech Leads

- **Primario**: [Architecture Document](MOBILE_PATIENT_PROFILE_ARCHITECTURE.md)
- **Implementación**: [Implementation Changelog](MOBILE_PATIENT_PROFILE_CHANGELOG.md)
- **Permisos**: [New Permissions Summary](NEW_PERMISSIONS_SUMMARY.md)

#### 📊 Product Owners y QA

- **Funcionalidad**: [Mobile Patient Profile API](mobile-patient-profile.md)
- **Estado**: [Implementation Changelog](MOBILE_PATIENT_PROFILE_CHANGELOG.md)
- **Testing**: Sección en Architecture Document

### Por Tipo de Información

#### 🔍 Referencias Rápidas

```
GET /patient/my-profile    → Ver perfil completo
PATCH /patient/my-profile  → Actualizar perfil
Permisos: VIEW_OWN_SETTINGS, UPDATE_OWN_SETTINGS
Tag Swagger: "Mobile - Patient Profile"
```

#### 📖 Guías Detalladas

- **API**: Casos de uso, ejemplos, integración
- **Arquitectura**: Flujos, componentes, optimizaciones
- **Implementación**: Archivos, cambios, estado

#### 🛠️ Referencias Técnicas

- **DTOs**: Tipos y estructuras de datos
- **Servicios**: Métodos y lógica de negocio
- **Permisos**: Configuración y validaciones

## 🔗 Enlaces Útiles

### Documentación en Vivo

- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)
- **Tag específico**: Mobile - Patient Profile

### Repositorio

- **Código fuente**: [SEGIMED Backend Repository](https://github.com/segimed/back)
- **Issues**: [GitHub Issues](https://github.com/segimed/back/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/segimed/back/pulls)

### Documentación Relacionada

- **[Multitenant Guide](MULTITENANT_GUIDE.md)**: Guía general multitenant
- **[Mobile Appointments](mobile-appointments.md)**: Otro endpoint móvil
- **[Patient Studies](patient-studies.md)**: Estudios con multitenant

## 📈 Estado de Completitud

| Componente      | Estado         | Documentación          |
| --------------- | -------------- | ---------------------- |
| **Endpoints**   | ✅ Completo    | API Guide + Swagger    |
| **Permisos**    | ✅ Completo    | Permissions Summary    |
| **DTOs**        | ✅ Completo    | Swagger + Architecture |
| **Multitenant** | ✅ Completo    | Architecture Guide     |
| **Testing**     | 🔄 Planificado | Architecture Guide     |
| **Deployment**  | ✅ Listo       | README.md              |

## 📞 Contacto y Soporte

### Para Consultas Técnicas

- **Team Lead**: Equipo de desarrollo SEGIMED
- **Architecture**: Architects team
- **Mobile Team**: Desarrollo móvil

### Para Reportar Issues

- **GitHub Issues**: Problemas técnicos
- **Documentation**: Mejoras a la documentación
- **Features**: Nuevas funcionalidades

---

**Índice de Documentación**: Mobile Patient Profile  
**Versión**: 1.0.0  
**Fecha**: June 13, 2025  
**Estado**: Documentación Completa ✅
