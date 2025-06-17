# Guía de Implementación Multitenant

Esta guía explica cómo funciona la arquitectura multitenant en el proyecto SEGIMED y cómo implementar nuevas funcionalidades que la soporten.

## Introducción

El sistema SEGIMED maneja múltiples organizaciones (tenants) donde:

- Un **paciente** puede estar asociado a múltiples organizaciones
- Los **datos médicos** (signos vitales, prescripciones, estudios) deben ser accesibles desde todas las organizaciones del paciente
- Los **médicos** pertenecen a organizaciones específicas y ven datos según sus permisos

## Arquitectura Multitenant

### 1. Esquema de Base de Datos

```sql
-- Tabla principal de tenants/organizaciones
tenant: {
  id: string (UUID)
  name: string
  type: string
  // ... otros campos
}

-- Relación paciente-organización (many-to-many)
patient_tenant: {
  id: string (UUID)
  patient_id: string (FK a user donde role='patient')
  tenant_id: string (FK a tenant)
  deleted: boolean
}

-- Tablas de datos médicos con tenant_id
prescription: {
  id: string
  patient_id: string
  tenant_id: string (nullable - para auto-asignadas)
  // ... otros campos
}

vital_signs: {
  id: string
  patient_id: string
  tenant_id: string
  // ... otros campos
}
```

### 2. Middleware de Tenant

**Archivo**: `src/utils/middleware/tenantPrismaMiddleware.ts`

```typescript
// Aplica filtros automáticos por tenant_id
// EXCEPCIÓN: Skip cuando hay lógica OR (queries multitenant)
if (params.action === 'findMany' || params.action === 'findFirst') {
  if (params.args.where?.OR) {
    // Skip automatic filtering for multitenant queries
    return next(params);
  }
  // Apply tenant filter...
}
```

## Patrones de Implementación

### 1. Obtención de Tenant IDs del Paciente

**Patrón estándar** usado en todos los servicios:

```typescript
/**
 * Obtiene los tenant IDs del paciente de forma optimizada
 */
private async getPatientTenantIds(
  patientId: string,
  userTenants?: { id: string; name: string; type: string }[],
): Promise<string[]> {
  // Si los tenants vienen del JWT, usarlos directamente
  if (userTenants && userTenants.length > 0) {
    return userTenants.map((tenant) => tenant.id);
  }

  // Sino, buscar en la DB con el patient_id directamente
  const patientTenants = await this.prisma.patient_tenant.findMany({
    where: {
      patient: {
        user_id: patientId,
      },
      deleted: false,
    },
    select: { tenant_id: true },
  });

  return patientTenants.map((pt) => pt.tenant_id);
}
```

### 2. Consultas Multitenant

**Patrón para buscar datos en todas las organizaciones del paciente**:

```typescript
async findByPatientId(
  patientId: string,
  userTenants?: { id: string; name: string; type: string }[],
) {
  // Obtener tenant IDs del paciente
  const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

  return this.prisma.data_table.findMany({
    where: {
      patient_id: patientId,
      // Buscar en todas las organizaciones del paciente
      tenant_id: { in: tenantIds },
    },
  });
}
```

### 3. Consultas con Datos Auto-asignados

**Para datos que pueden no tener tenant_id (ej: prescripciones auto-asignadas)**:

```typescript
const prescriptions = await this.prisma.prescription.findMany({
  where: {
    patient_id: patientId,
    OR: [
      // Prescripciones de organizaciones del paciente
      { tenant_id: { in: tenantIds } },
      // Prescripciones auto-asignadas (sin tenant_id)
      {
        created_by_patient: true,
        tenant_id: null,
      },
    ],
  },
});
```

### 4. Endpoints de Controlador

**Patrón estándar para endpoints multitenant**:

```typescript
@Get('by-patient/:patient_id')
async findByPatientId(
  @Param('patient_id') patientId: string,
  @Request() req: any,
) {
  const userTenants = req.userTenants || [];
  return this.service.findByPatientId(patientId, userTenants);
}
```

## Módulos Implementados

### ✅ Vital Signs

- **Multitenant**: Implementado desde el inicio
- **Endpoint**: `GET /vital-signs/by-patient/{patient_id}`
- **Funcionalidad**: Incluye tanto datos de organizaciones como auto-evaluaciones

### ✅ Prescriptions (Mobile Functions)

- **Multitenant**: Implementado y corregido
- **Endpoints**:
  - `GET /mobile/prescriptions/tracking`
  - `POST /mobile/prescriptions/activate-tracking`
  - `POST /mobile/prescriptions/toggle-reminder`
- **Funcionalidad**: Incluye prescripciones de organizaciones y auto-asignadas

### ✅ Patient Studies

- **Multitenant**: Implementado recientemente
- **Endpoint**: `GET /patient-studies/by-patient/{patient_id}`
- **Funcionalidad**: Busca estudios en todas las organizaciones del paciente

### ✅ Mobile Appointments

- **Multitenant**: Implementado
- **Endpoints**:
  - `GET /mobile/appointments`
  - `PATCH /mobile/appointments/{id}/cancel`
- **Funcionalidad**: Citas de todas las organizaciones del paciente

## Cómo Implementar Multitenant en Nuevos Módulos

### Paso 1: Servicio

1. **Agregar método `getPatientTenantIds()`**:

```typescript
private async getPatientTenantIds(
  patientId: string,
  userTenants?: { id: string; name: string; type: string }[],
): Promise<string[]> {
  // Copiar implementación estándar
}
```

2. **Actualizar métodos de consulta**:

```typescript
async findByPatientId(
  patientId: string,
  userTenants?: { id: string; name: string; type: string }[],
) {
  const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

  return this.prisma.your_table.findMany({
    where: {
      patient_id: patientId,
      tenant_id: { in: tenantIds },
    },
  });
}
```

### Paso 2: Controlador

1. **Agregar endpoint multitenant**:

```typescript
@Get('by-patient/:patient_id')
async findByPatientId(
  @Param('patient_id') patientId: string,
  @Request() req: any,
) {
  const userTenants = req.userTenants || [];
  return this.yourService.findByPatientId(patientId, userTenants);
}
```

### Paso 3: Documentación

1. **Crear/actualizar documentación del módulo**
2. **Especificar funcionalidad multitenant**
3. **Incluir ejemplos de uso**

## Casos Especiales

### 1. Datos Auto-asignados

Para datos que pueden no tener `tenant_id` (como prescripciones auto-asignadas):

```typescript
OR: [
  { tenant_id: { in: tenantIds } },
  {
    created_by_patient: true,
    tenant_id: null
  },
],
```

### 2. Middleware Prisma y Consultas OR

El middleware automático de Prisma skip las consultas que usan lógica OR para permitir multitenant:

```typescript
if (params.args.where?.OR) {
  return next(params); // Skip automatic tenant filtering
}
```

### 3. Optimización con JWT

Priorizar tenants del JWT para evitar consultas innecesarias:

```typescript
if (userTenants && userTenants.length > 0) {
  return userTenants.map((tenant) => tenant.id);
}
// Solo si no hay tenants en JWT, consultar DB
```

## Testing Multitenant

### 1. Casos de Prueba Estándar

```typescript
describe('Multitenant functionality', () => {
  it('should get data from all patient organizations', async () => {
    // Setup: paciente en múltiples organizaciones
    // Test: endpoint devuelve datos de todas las organizaciones
  });

  it('should prioritize JWT tenants over DB query', async () => {
    // Test: cuando hay tenants en JWT, no consulta DB
  });

  it('should handle patients with no organizations', async () => {
    // Test: manejo correcto cuando paciente no tiene organizaciones
  });
});
```

### 2. Test de Integración

```bash
# Test con paciente en múltiples organizaciones
GET /api/your-endpoint/by-patient/patient-id
Authorization: Bearer jwt-with-tenants

# Verificar que devuelve datos de todas las organizaciones
```

## Mejores Prácticas

### 1. Performance

- ✅ **Usar tenants del JWT** cuando estén disponibles
- ✅ **Consultas batch** para datos relacionados
- ✅ **Filtros a nivel DB** en lugar de filtros en aplicación
- ✅ **Mapas para relacionar datos** en lugar de nested loops

### 2. Seguridad

- ✅ **Validar pertenencia** del paciente a organizaciones
- ✅ **Filtrar por tenant_id** en todas las consultas
- ✅ **No exponer datos** de organizaciones no autorizadas
- ✅ **Logs de auditoría** para accesos multitenant

### 3. Compatibilidad

- ✅ **Parámetros opcionales** para mantener retrocompatibilidad
- ✅ **Fallback a comportamiento anterior** cuando no hay userTenants
- ✅ **Endpoints existentes** siguen funcionando sin cambios

## Troubleshooting

### Problema: Middleware bloquea consultas multitenant

**Solución**: Verificar que el middleware skip consultas con lógica OR

```typescript
if (params.args.where?.OR) {
  return next(params);
}
```

### Problema: No devuelve datos de todas las organizaciones

**Solución**: Verificar que `tenant_id: { in: tenantIds }` esté en el WHERE

```typescript
where: {
  patient_id: patientId,
  tenant_id: { in: tenantIds }, // ← Importante
}
```

### Problema: Performance lenta

**Solución**: Usar tenants del JWT y optimizar consultas

```typescript
// Priorizar JWT
if (userTenants && userTenants.length > 0) {
  return userTenants.map((t) => t.id);
}
```

## Roadmap

### Próximos Módulos a Implementar

- [ ] Medical Events
- [ ] Pharmacy/Medications
- [ ] Lab Results
- [ ] Imaging Studies
- [ ] Clinical Notes

### Mejoras Futuras

- [ ] Cache de tenant IDs por paciente
- [ ] Métricas de performance multitenant
- [ ] Testing automatizado de casos multitenant
- [ ] Documentación auto-generada de endpoints multitenant
