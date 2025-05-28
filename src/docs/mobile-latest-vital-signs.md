# API de Últimos Signos Vitales - Móvil

Este endpoint permite a los pacientes obtener el último registro de todos los tipos de signos vitales del catálogo, independientemente de si fueron registrados durante una consulta médica o mediante autoevaluación.

## Endpoint

### Obtener Último Registro de Todos los Signos Vitales

```http
GET /mobile/self-evaluation-event/latest-vital-signs/all
```

Obtiene el último valor registrado para cada tipo de signo vital del catálogo para el paciente autenticado.

#### Headers Requeridos

| Header        | Requerido | Descripción                  |
| ------------- | --------- | ---------------------------- |
| Authorization | Sí        | Bearer {access_token}        |
| tenant-id     | Sí        | UUID del tenant del paciente |

#### Permisos Requeridos

- **Autenticación**: Requerida (Paciente vía JWT)
- **Permiso**: `VIEW_PATIENT_DETAILS`
- **Acceso**: El paciente solo puede acceder a su propia información

#### Lógica de Negocio

1. **Extracción del paciente**: Se obtiene el `patient_id` del token JWT del usuario autenticado
2. **Obtención del catálogo**: Se recuperan todos los tipos de signos vitales del catálogo (`cat_vital_signs`)
3. **Búsqueda de registros**: Para cada tipo de signo vital del catálogo:
   - Se busca el registro más reciente en la tabla `vital_signs` para el `patient_id` y el `vital_sign_id` actual
   - Se consideran tanto los registros asociados a `medical_event_id` como a `self_evaluation_event_id`
   - Se ordena por `created_at DESC` y se toma el primero
4. **Construcción de respuesta**:
   - Si se encuentra un registro: se incluye la medida, fecha de creación e información del catálogo
   - Si no se encuentra: el valor de la medida es "Sin datos" y la fecha es `null`
5. **Información incluida**: Se incluye toda la información del catálogo excepto el campo `specialties`

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "data": [
    {
      "vital_sign": {
        "id": 1,
        "name": "Frecuencia Cardíaca",
        "category": "Cardiovascular",
        "color": "#FF5733",
        "mini_icon": "heart-mini",
        "icon": "heart-icon",
        "background_icon": "heart-background",
        "normal_min_value": 60,
        "normal_max_value": 100,
        "slightly_high_value": 120,
        "high_max_value": 140,
        "critical_max_value": 180
      },
      "measure": 98,
      "created_at": "2024-01-15T10:30:00.000Z",
      "cat_measure_unit": {
        "id": 1,
        "name": "bpm",
        "description": "Latidos por minuto"
      }
    },
    {
      "vital_sign": {
        "id": 2,
        "name": "Temperatura",
        "category": "General",
        "color": "#FFA500",
        "mini_icon": "temp-mini",
        "icon": "temp-icon",
        "background_icon": "temp-background",
        "normal_min_value": 36.1,
        "normal_max_value": 37.2,
        "slightly_high_value": 37.5,
        "high_max_value": 38.5,
        "critical_max_value": 40.0
      },
      "measure": 36.8,
      "created_at": "2024-01-14T15:45:00.000Z",
      "cat_measure_unit": {
        "id": 2,
        "name": "°C",
        "description": "Grados Celsius"
      }
    },
    {
      "vital_sign": {
        "id": 3,
        "name": "Presión Arterial",
        "category": "Cardiovascular",
        "color": "#FF0000",
        "mini_icon": "pressure-mini",
        "icon": "pressure-icon",
        "background_icon": "pressure-background",
        "normal_min_value": 90,
        "normal_max_value": 140,
        "slightly_high_value": 150,
        "high_max_value": 180,
        "critical_max_value": 200
      },
      "measure": "Sin datos",
      "created_at": null,
      "cat_measure_unit": {
        "id": 3,
        "name": "mmHg",
        "description": "Milímetros de mercurio"
      }
    }
  ]
}
```

#### Estructura de la Respuesta

| Campo                                   | Tipo                  | Descripción                                           |
| --------------------------------------- | --------------------- | ----------------------------------------------------- |
| `data`                                  | Array                 | Array de objetos con información de signos vitales    |
| `data[].vital_sign`                     | Object                | Información del catálogo del signo vital              |
| `data[].vital_sign.id`                  | number                | ID del signo vital en el catálogo                     |
| `data[].vital_sign.name`                | string                | Nombre del signo vital                                |
| `data[].vital_sign.category`            | string                | Categoría del signo vital                             |
| `data[].vital_sign.color`               | string \| null        | Color asociado para la UI                             |
| `data[].vital_sign.mini_icon`           | string \| null        | Identificador del mini icono                          |
| `data[].vital_sign.icon`                | string \| null        | Identificador del icono                               |
| `data[].vital_sign.background_icon`     | string \| null        | Identificador del icono de fondo                      |
| `data[].vital_sign.normal_min_value`    | number \| null        | Valor mínimo normal                                   |
| `data[].vital_sign.normal_max_value`    | number \| null        | Valor máximo normal                                   |
| `data[].vital_sign.slightly_high_value` | number \| null        | Valor umbral ligeramente alto                         |
| `data[].vital_sign.high_max_value`      | number \| null        | Valor máximo alto                                     |
| `data[].vital_sign.critical_max_value`  | number \| null        | Valor máximo crítico                                  |
| `data[].measure`                        | number \| "Sin datos" | Último valor medido o "Sin datos" si no hay registros |
| `data[].created_at`                     | string \| null        | Fecha de creación del último registro (ISO 8601)      |
| `data[].cat_measure_unit`               | Object \| null        | Información de la unidad de medida                    |
| `data[].cat_measure_unit.id`            | number                | ID de la unidad de medida                             |
| `data[].cat_measure_unit.name`          | string                | Nombre de la unidad de medida                         |
| `data[].cat_measure_unit.description`   | string                | Descripción de la unidad de medida                    |

#### Códigos de Error

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Error al obtener los últimos signos vitales: [detalle del error]",
  "error": "Bad Request"
}
```

**Código de Estado**: 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Usuario no autenticado",
  "error": "Unauthorized"
}
```

**Código de Estado**: 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "No tiene acceso a esta organización",
  "error": "Forbidden"
}
```

**Código de Estado**: 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Paciente no encontrado",
  "error": "Not Found"
}
```

## Características Técnicas

### Fuentes de Datos

El endpoint considera registros de signos vitales de ambas fuentes:

1. **Consultas Médicas**: Registros asociados a `medical_event_id`
2. **Autoevaluaciones**: Registros asociados a `self_evaluation_event_id`

### Ordenamiento

- Los signos vitales se devuelven ordenados alfabéticamente por nombre
- Para cada tipo, se toma el registro más reciente basado en `created_at`

### Filtros Aplicados

- Solo se consideran registros no eliminados (`deleted = false`)
- Solo se incluyen registros del paciente autenticado
- **No se aplica filtro por tenant** en los resultados como se especifica en los requisitos

### Optimización

- Se utiliza una consulta por cada tipo de signo vital para obtener el más reciente
- Se incluyen las relaciones necesarias en una sola consulta para evitar N+1 queries

## Casos de Uso

### Aplicación Móvil

Este endpoint es ideal para:

1. **Dashboard del paciente**: Mostrar un resumen de todos los signos vitales
2. **Historial médico**: Proporcionar una vista completa del estado de salud
3. **Seguimiento de salud**: Permitir al paciente ver qué signos vitales ha registrado
4. **Interfaz de autoevaluación**: Mostrar valores previos como referencia

### Integración con UI

La información del catálogo incluye campos específicos para la interfaz:

- `color`: Para códigos de color en gráficos y elementos visuales
- `mini_icon`, `icon`, `background_icon`: Para diferentes contextos de visualización
- Rangos de valores: Para validación y alertas visuales

## Seguridad

- **Autenticación obligatoria**: Solo usuarios autenticados pueden acceder
- **Autorización por paciente**: Cada paciente solo ve sus propios datos
- **Validación de tenant**: Se verifica el acceso al tenant especificado
- **Permisos granulares**: Requiere permiso específico para ver detalles del paciente
