# Resumen de Permisos - Nueva Funcionalidad Multitenant

Este documento describe todos los permisos utilizados en las nuevas funcionalidades implementadas y cómo están configurados en el sistema de actualización de permisos.

## Permisos Utilizados en Nueva Funcionalidad

### Para Patient Studies (Estudios del Paciente)

| Endpoint                               | Permiso Requerido          | Descripción               | Tipo de Usuario |
| -------------------------------------- | -------------------------- | ------------------------- | --------------- |
| `POST /patient-studies`                | `MANAGE_CATALOGS`          | Crear nuevos estudios     | Profesionales   |
| `GET /patient-studies`                 | `VIEW_PATIENTS_LIST`       | Ver todos los estudios    | Profesionales   |
| `GET /patient-studies/my-studies`      | `VIEW_OWN_MEDICAL_RECORDS` | Ver estudios propios      | **Pacientes**   |
| `GET /patient-studies/by-patient/{id}` | `VIEW_PATIENT_DETAILS`     | Ver estudios de pacientes | Profesionales   |
| `GET /patient-studies/{id}`            | `VIEW_PATIENT_DETAILS`     | Ver estudio específico    | Profesionales   |
| `PATCH /patient-studies/{id}`          | `EDIT_PATIENT_INFO`        | Actualizar estudios       | Profesionales   |
| `DELETE /patient-studies/{id}`         | `DELETE_PATIENTS`          | Eliminar estudios         | Profesionales   |

### Para Cat Identification Type (Tipos de Identificación)

| Endpoint                               | Permiso Requerido | Descripción         | Tipo de Usuario |
| -------------------------------------- | ----------------- | ------------------- | --------------- |
| `POST /cat-identification-type`        | `MANAGE_CATALOGS` | Crear tipos de ID   | Administradores |
| `GET /cat-identification-type`         | `MANAGE_CATALOGS` | Ver tipos de ID     | Administradores |
| `GET /cat-identification-type/{id}`    | `MANAGE_CATALOGS` | Ver tipo específico | Administradores |
| `PATCH /cat-identification-type/{id}`  | `MANAGE_CATALOGS` | Actualizar tipos    | Administradores |
| `DELETE /cat-identification-type/{id}` | `MANAGE_CATALOGS` | Eliminar tipos      | Administradores |

### Para Mobile Appointments (Citas Móviles)

| Endpoint                                 | Permiso Requerido       | Descripción            | Tipo de Usuario |
| ---------------------------------------- | ----------------------- | ---------------------- | --------------- |
| `GET /mobile/appointments`               | `VIEW_OWN_APPOINTMENTS` | Ver citas propias      | **Pacientes**   |
| `PATCH /mobile/appointments/{id}/cancel` | `VIEW_OWN_APPOINTMENTS` | Cancelar citas propias | **Pacientes**   |

### Para Mobile Self-Evaluation Events (Signos Vitales) 🆕

| Endpoint                                                     | Permiso Requerido          | Descripción                        | Tipo de Usuario |
| ------------------------------------------------------------ | -------------------------- | ---------------------------------- | --------------- |
| `POST /mobile/self-evaluation-event/vital-signs`             | `REGISTER_OWN_VITAL_SIGNS` | Registrar signos vitales propios   | **Pacientes**   |
| `GET /mobile/self-evaluation-event/latest-vital-signs/all`   | `VIEW_OWN_VITAL_SIGNS`     | Ver últimos signos vitales propios | **Pacientes**   |
| `GET /mobile/self-evaluation-event/vital-signs/{id}/history` | `VIEW_OWN_VITAL_SIGNS`     | Ver historial de signos vitales    | **Pacientes**   |
| `POST /mobile/self-evaluation-event`                         | `VIEW_PATIENT_DETAILS`     | Crear autoevaluación (con evento)  | Profesionales   |

### Para Mobile Patient Profile (Perfil de Paciente Móvil) 🆕🆕

| Endpoint                    | Permiso Requerido     | Descripción                | Tipo de Usuario |
| --------------------------- | --------------------- | -------------------------- | --------------- |
| `GET /patient/my-profile`   | `VIEW_OWN_SETTINGS`   | Ver perfil completo propio | **Pacientes**   |
| `PATCH /patient/my-profile` | `UPDATE_OWN_SETTINGS` | Actualizar perfil propio   | **Pacientes**   |

## Configuración en Permission Updater

Los permisos están configurados en `src/auth/services/permission-updater.service.ts`:

### Permisos para Médicos/Profesionales

```typescript
const physicianPermissions = [
  // ... permisos existentes ...
  Permission.DELETE_PATIENTS, // ✅ AGREGADO - Para gestión de estudios
  Permission.MANAGE_CATALOGS, // ✅ AGREGADO - Para gestión de catálogos
  // ... otros permisos ...
];
```

### Permisos para Pacientes

```typescript
const patientPermissions = [
  Permission.VIEW_OWN_APPOINTMENTS, // ✅ YA EXISTÍA - Para citas móviles
  Permission.VIEW_OWN_MEDICAL_RECORDS, // ✅ YA EXISTÍA - Para estudios propios
  Permission.VIEW_OWN_SETTINGS, // 🆕 NUEVO - Para ver perfil propio móvil
  Permission.UPDATE_OWN_SETTINGS, // 🆕 NUEVO - Para actualizar perfil propio móvil
  // ... otros permisos existentes ...
];
```

## Nuevos Permisos Clave

### `UPDATE_OWN_SETTINGS` 🔑🆕

- **Uso**: Permite a los pacientes actualizar su propio perfil
- **Endpoints**: `PATCH /patient/my-profile`
- **Funcionalidad**: Actualizaciones parciales con soporte multitenant
- **Seguridad**: Solo datos del paciente autenticado, transacciones atómicas

### `VIEW_OWN_SETTINGS` 🔑🆕

- **Uso**: Permite a los pacientes ver su perfil completo
- **Endpoints**: `GET /patient/my-profile`
- **Funcionalidad**: Consolidación de datos médicos multitenant
- **Seguridad**: Solo datos del paciente autenticado (ID desde JWT)

### `VIEW_OWN_MEDICAL_RECORDS` 🔑

- **Uso**: Permite a los pacientes ver sus propios estudios médicos
- **Endpoints**: `GET /patient-studies/my-studies`
- **Funcionalidad**: Soporte multitenant automático
- **Seguridad**: Solo datos del paciente autenticado (ID desde JWT)

### `VIEW_OWN_APPOINTMENTS` 🔑

- **Uso**: Permite a los pacientes ver y cancelar sus propias citas
- **Endpoints**:
  - `GET /mobile/appointments`
  - `PATCH /mobile/appointments/{id}/cancel`
- **Funcionalidad**: Soporte multitenant automático
- **Seguridad**: Solo citas del paciente autenticado (ID desde JWT)

### `MANAGE_CATALOGS` 🔑

- **Uso**: Gestión completa de catálogos del sistema
- **Endpoints**: Todos los endpoints de `cat-identification-type`
- **Usuarios**: Administradores y profesionales con permisos
- **Nuevos catálogos**: Tipos de identificación

## Funcionalidad Multitenant

### Para Pacientes

Los endpoints de pacientes automáticamente:

1. **Extraen patient_id**: Del JWT token (req.user.id)
2. **Obtienen organizaciones**: Del JWT o consultando `patient_tenant`
3. **Buscan datos**: En todas las organizaciones usando `tenant_id: { in: tenantIds }`
4. **Garantizan seguridad**: Solo datos propios del paciente

### Para Profesionales

Los endpoints de profesionales:

1. **Requieren patient_id**: Como parámetro explícito
2. **Usan organización actual**: Del header `tenant_id`
3. **Permiten gestión**: De datos de pacientes bajo su cuidado

## Cómo Actualizar Permisos

### Paso 1: Ejecutar Actualización

```bash
POST /auth/permissions/update
Authorization: Bearer <admin-jwt-token>
```

### Paso 2: Verificar Logs

El servicio reportará:

```json
{
  "message": "Actualización de permisos completada",
  "stats": {
    "physicians": {
      "processed": 25,
      "updated": 3,
      "rolesUpdated": 2
    },
    "patients": {
      "processed": 150,
      "updated": 12,
      "rolesUpdated": 1
    },
    "errors": 0
  }
}
```

## Validaciones de Seguridad

### Automáticas por JWT

- ✅ **Usuario autenticado**: JWT válido obligatorio
- ✅ **Rol correcto**: Validación automática de rol (patient/physician)
- ✅ **Datos propios**: Pacientes solo ven sus datos
- ✅ **Multitenant**: Acceso a todas las organizaciones del usuario

### Validaciones de Negocio

- ✅ **Estados válidos**: Solo citas pendientes se pueden cancelar
- ✅ **Temporalidad**: No se pueden cancelar citas pasadas
- ✅ **Pertenencia**: Solo recursos del usuario autenticado

## Beneficios de la Implementación

### Para Desarrolladores

- **Reutilización**: Mismos patrones en todos los endpoints
- **Consistencia**: Validaciones automáticas uniformes
- **Mantenibilidad**: Lógica centralizada de multitenant

### Para Usuarios

- **Seguridad**: No exposición de IDs de pacientes en URLs
- **Experiencia**: Acceso automático a datos de todas sus organizaciones
- **Funcionalidad**: Capacidades completas desde móvil

### Para Administradores

- **Control granular**: Permisos específicos por funcionalidad
- **Actualización automática**: Sistema de migración de permisos
- **Auditabilidad**: Logs detallados de cambios de permisos

## Próximos Pasos

1. **Ejecutar update de permisos** en todos los entornos
2. **Verificar funcionalidad** en aplicación móvil
3. **Documentar para frontend** las nuevas capacidades
4. **Monitorear logs** para identificar problemas de permisos

## Contacto

Para dudas sobre permisos o funcionalidad multitenant, consultar:

- `src/auth/services/permission-updater.service.ts`
- `src/docs/MULTITENANT_GUIDE.md`
- Este documento (`NEW_PERMISSIONS_SUMMARY.md`)
