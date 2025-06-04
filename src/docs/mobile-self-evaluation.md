# Mobile Self-Evaluation Events API - Signos Vitales

Este documento describe los endpoints de autoevaluación móvil para el registro y consulta de signos vitales por parte de los pacientes.

**Todos los endpoints están dirigidos específicamente a pacientes. El ID del paciente se extrae automáticamente del JWT token.**

## Endpoints

### `POST /mobile/self-evaluation-event/vital-signs` 🆕

**Endpoint principal para pacientes - Registrar signos vitales propios**

Permite a los pacientes registrar sus propios signos vitales desde la aplicación móvil. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `Authorization` (string, required): Bearer token JWT del paciente.

**Permisos requeridos:**

- `REGISTER_OWN_VITAL_SIGNS`: Registrar signos vitales propios.

**Request Body:**

```json
{
  "vital_signs": [
    { "vital_sign_id": 1, "measure": 36.5 }, // Temperatura corporal en °C
    { "vital_sign_id": 2, "measure": 120 }, // Presión sistólica en mmHg
    { "vital_sign_id": 3, "measure": 80 }, // Presión diastólica en mmHg
    { "vital_sign_id": 4, "measure": 75 } // Frecuencia cardíaca en bpm
  ]
}
```

**Validaciones Automáticas:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Datos propios**: Solo puede registrar sus propios signos vitales
- ✅ **Al menos un signo vital**: Debe proporcionar mínimo un registro

**Características:**

- **Sin medical_event_id**: No requiere evento médico asociado (signos vitales independientes)
- **Sin tenant_id**: Se guardan como datos globales del paciente
- **Sin patient_id**: Se extrae automáticamente del JWT
- **Multitenant**: Disponible para pacientes de cualquier organización

**Responses:**

- `201 Created`: Signos vitales registrados exitosamente.
  ```json
  {
    "id": "uuid-evento",
    "patient_id": "uuid-paciente",
    "medical_event_id": null,
    "created_at": "2024-01-15T10:30:00Z",
    "vital_signs": [
      {
        "id": "uuid-signo",
        "measure": 36.5,
        "vital_sign_name": "Temperatura Corporal",
        "measure_unit": "°C",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "message": "Signos vitales registrados exitosamente"
  }
  ```

**Error Responses:**

- `400 Bad Request`: Usuario no es paciente o datos inválidos.
- `401 Unauthorized`: Token JWT inválido o faltante.
- `403 Forbidden`: No tiene permisos para registrar signos vitales.

**Ejemplo de uso:**

```bash
POST /mobile/self-evaluation-event/vital-signs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vital_signs": [
    { "vital_sign_id": 1, "measure": 36.8 },
    { "vital_sign_id": 2, "measure": 125 },
    { "vital_sign_id": 3, "measure": 82 }
  ]
}
```

### `GET /mobile/self-evaluation-event/latest-vital-signs/all`

**Obtener último registro de todos los signos vitales propios**

Obtiene el último valor registrado para cada tipo de signo vital del catálogo para el paciente autenticado. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `Authorization` (string, required): Bearer token JWT del paciente.

**Permisos requeridos:**

- `VIEW_OWN_VITAL_SIGNS`: Ver signos vitales propios.

**Validaciones Automáticas:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Datos propios**: Solo puede ver sus propios signos vitales

**Funcionalidad:**

- **Datos completos**: Incluye signos vitales registrados por el paciente Y por médicos durante consultas
- **Catálogo completo**: Muestra todos los tipos de signos vitales disponibles
- **Sin datos**: Si nunca registró un tipo, se indica "Sin datos"
- **Multitenant**: Busca en todas las organizaciones del paciente

**Responses:**

- `200 OK`: Últimos signos vitales obtenidos exitosamente.
  ```json
  {
    "data": [
      {
        "vital_sign": {
          "id": 1,
          "name": "Temperatura Corporal",
          "category": "Básicos",
          "color": "#FF5722",
          "normal_min_value": 36.0,
          "normal_max_value": 37.5
        },
        "measure": 36.5,
        "created_at": "2024-01-15T10:30:00Z",
        "cat_measure_unit": {
          "id": 1,
          "name": "°C",
          "description": "Grados Celsius"
        }
      },
      {
        "vital_sign": {
          "id": 2,
          "name": "Presión Arterial Sistólica",
          "category": "Cardiovascular"
        },
        "measure": "Sin datos",
        "created_at": undefined
      }
    ]
  }
  ```

### `GET /mobile/self-evaluation-event/vital-signs/{vitalSignTypeId}/history`

**Obtener historial y analítica de un signo vital específico propio**

Obtiene un historial detallado y estadísticas mensuales para un tipo de signo vital específico del paciente autenticado. **El ID del paciente se obtiene automáticamente del JWT token.**

**Headers:**

- `Authorization` (string, required): Bearer token JWT del paciente.

**Permisos requeridos:**

- `VIEW_OWN_VITAL_SIGNS`: Ver signos vitales propios.

**Path Parameters:**

- `vitalSignTypeId` (number): ID del tipo de signo vital del catálogo.

**Query Parameters:**

- `month` (string, required): Mes en formato YYYY-MM (ej: "2024-01").

**Validaciones Automáticas:**

- ✅ **Usuario autenticado**: Debe tener JWT válido
- ✅ **Solo pacientes**: Solo usuarios con rol 'patient'
- ✅ **Datos propios**: Solo puede ver sus propios signos vitales
- ✅ **Formato de mes**: Debe ser YYYY-MM válido

**Funcionalidad:**

- **Datos históricos**: Incluye registros del paciente Y de médicos durante consultas
- **Estadísticas mensuales**: Promedio, mínimo, máximo, cantidad de registros
- **Organización semanal**: Datos agrupados por semanas del mes
- **Multitenant**: Busca en todas las organizaciones del paciente

**Responses:**

- `200 OK`: Historial y estadísticas obtenidas exitosamente.
  ```json
  {
    "monthly_stats": {
      "average": 36.7,
      "min_value": 36.2,
      "max_value": 37.1,
      "total_records": 15,
      "vital_sign_info": {
        "name": "Temperatura Corporal",
        "normal_min_value": 36.0,
        "normal_max_value": 37.5
      }
    },
    "weekly_data": [
      {
        "week_number": 1,
        "week_range": "1-7",
        "days": [
          {
            "day": 1,
            "date": "2024-01-01",
            "records": [
              {
                "measure": 36.5,
                "created_at": "2024-01-01T08:00:00Z"
              }
            ]
          }
        ]
      }
    ]
  }
  ```

### `POST /mobile/self-evaluation-event` (Para profesionales)

**Crear evento de autoevaluación asociado a consulta médica**

Este endpoint está destinado a profesionales de la salud para crear eventos de autoevaluación asociados a eventos médicos específicos.

**Headers:**

- `Authorization` (string, required): Bearer token JWT del profesional.
- `tenant-id` (string, required): ID del tenant.

**Permisos requeridos:**

- `VIEW_PATIENT_DETAILS`: Ver detalles de pacientes.

**Request Body:**

```json
{
  "patient_id": "uuid-paciente",
  "medical_event_id": "uuid-evento-medico",
  "tenant_id": "uuid-tenant",
  "vital_signs": [{ "vital_sign_id": 1, "measure": 36.5 }]
}
```

## Diferencias entre Endpoints

| Aspecto           | `/vital-signs` (Pacientes)    | Base endpoint (Profesionales)      |
| ----------------- | ----------------------------- | ---------------------------------- |
| **Usuario**       | Solo pacientes                | Profesionales de la salud          |
| **Patient ID**    | Del JWT automáticamente       | Parámetro requerido                |
| **Medical Event** | No requerido (signos propios) | Requerido (asociado a consulta)    |
| **Tenant ID**     | No requerido (datos globales) | Requerido en header                |
| **Alcance**       | Solo datos propios            | Datos de pacientes bajo su cuidado |
| **Propósito**     | Automonitoreo del paciente    | Registro durante consulta médica   |

## Características de Seguridad

### Validaciones Automáticas

Todos los endpoints de pacientes realizan validaciones automáticas:

1. **Autenticación**: JWT válido y no expirado
2. **Autorización**: Usuario debe ser paciente (`role: 'patient'`)
3. **Ownership**: Solo puede acceder a sus propios datos
4. **Datos globales**: Los signos vitales propios se guardan como datos globales del paciente

### No Hay Exposición de IDs

- **Patient ID**: Se obtiene del JWT, no se expone en URLs ni body
- **Medical Event ID**: No se requiere para signos vitales propios
- **Tenant ID**: No se requiere, se manejan como datos globales del paciente

## Beneficios para Pacientes

### Facilidad de Uso

- **Sin IDs manuales**: Todo automático desde JWT
- **Sin contexto médico**: No necesita evento médico para registrar
- **Datos globales**: Accesibles desde cualquier organización

### Funcionalidad Completa

- **Registro simple**: Solo seleccionar signos vitales y valores
- **Historial completo**: Ve todos sus datos sin importar el origen
- **Estadísticas**: Analítica mensual y tendencias
- **Catálogo completo**: Ve todos los tipos disponibles

### Privacidad y Seguridad

- **Datos propios únicamente**: No puede ver datos de otros pacientes
- **Autenticación obligatoria**: JWT válido requerido siempre
- **Multitenant seguro**: Acceso a todas sus organizaciones de forma segura

## Casos de Uso Móviles

### Registro Diario de Signos Vitales

```bash
# Paciente registra temperatura y presión arterial matutina
POST /mobile/self-evaluation-event/vital-signs
Authorization: Bearer <patient-jwt-token>

{
  "vital_signs": [
    { "vital_sign_id": 1, "measure": 36.6 },
    { "vital_sign_id": 2, "measure": 118 },
    { "vital_sign_id": 3, "measure": 78 }
  ]
}
```

### Dashboard de Salud

```bash
# Ver todos los últimos registros para mostrar en pantalla principal
GET /mobile/self-evaluation-event/latest-vital-signs/all
Authorization: Bearer <patient-jwt-token>
```

### Análisis de Tendencias

```bash
# Ver evolución de presión arterial en enero 2024
GET /mobile/self-evaluation-event/vital-signs/2/history?month=2024-01
Authorization: Bearer <patient-jwt-token>
```

## Integración con Otros Módulos

- **Authentication**: Usa JWT para identificar al paciente automáticamente
- **Vital Signs Catalog**: Se integra con el catálogo completo de signos vitales
- **Patient Management**: Acceso multitenant a datos del paciente
- **Medical Events**: Compatible con registros de consultas médicas
- **Mobile Architecture**: Sigue patrones consistentes con otros módulos móviles

## Próximos Pasos

1. **Probar endpoints** desde aplicación móvil
2. **Verificar permisos** en diferentes organizaciones
3. **Validar multitenant** con pacientes de múltiples organizaciones
4. **Optimizar rendimiento** para grandes volúmenes de datos

## Contacto

Para dudas sobre funcionalidad de signos vitales móviles, consultar:

- Este documento (`mobile-self-evaluation.md`)
- `src/mobile-functions/self-evaluation-event/`
- `src/docs/NEW_PERMISSIONS_SUMMARY.md`
