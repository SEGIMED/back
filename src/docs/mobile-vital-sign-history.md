# API de Historial de Signos Vitales - Móvil

Este endpoint permite a los pacientes obtener un historial detallado y estadísticas mensuales para un tipo de signo vital específico, con datos organizados por semanas.

## Endpoint

### Obtener Historial y Analítica de un Signo Vital Específico

```http
GET /mobile/self-evaluation-event/vital-signs/:vitalSignTypeId/history?month=YYYY-MM
```

Obtiene un historial detallado y estadísticas mensuales para un tipo de signo vital específico registrado por el paciente (o por un médico en consulta).

#### Path Parameters

| Parámetro       | Tipo   | Requerido | Descripción                                                  |
| --------------- | ------ | --------- | ------------------------------------------------------------ |
| vitalSignTypeId | number | Sí        | ID del tipo de signo vital del catálogo (cat_vital_signs.id) |

#### Query Parameters

| Parámetro | Tipo   | Requerido | Descripción                              | Ejemplo   |
| --------- | ------ | --------- | ---------------------------------------- | --------- |
| month     | string | Sí        | Mes en formato YYYY-MM para el historial | "2023-10" |

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

1. **Validación de parámetros**:

   - Validar que `vitalSignTypeId` sea un número válido
   - Validar que `month` tenga formato YYYY-MM
   - Verificar que el tipo de signo vital existe en el catálogo

2. **Extracción del paciente**: Se obtiene el `patient_id` del token JWT

3. **Filtrado de registros**: Se obtienen todos los registros de `vital_signs` para:

   - El `patient_id` del usuario autenticado
   - El `vitalSignTypeId` especificado
   - El mes especificado en el parámetro `month`
   - Considerando tanto `medical_event_id` como `self_evaluation_event_id`

4. **Cálculo de estadísticas mensuales**:

   - **Último valor**: Último registro del mes por fecha
   - **Valor máximo**: Mayor valor registrado en el mes
   - **Valor mínimo**: Menor valor registrado en el mes
   - **Promedio**: Promedio de todos los valores del mes
   - **Alertas**: Cantidad de registros que superaron `critical_max_value`

5. **Organización semanal**:
   - Agrupar registros por semanas (domingo a sábado)
   - Para cada día: calcular promedio si hay múltiples registros
   - Incluir todos los días del mes, marcando "Sin datos" cuando no hay registros

#### Respuesta

**Código de Estado**: 200 OK

```json
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
  "cat_measure_unit": {
    "id": 1,
    "name": "bpm",
    "description": "Latidos por minuto"
  },
  "month": "2023-10",
  "monthly_stats": {
    "last_value": 102,
    "last_value_date": "2023-10-28T14:30:00.000Z",
    "max_value": 110,
    "max_value_date": "2023-10-15T09:15:00.000Z",
    "min_value": 85,
    "min_value_date": "2023-10-03T07:45:00.000Z",
    "average_value": 96.8,
    "total_records": 25,
    "alerts_count": 3
  },
  "weekly_data": [
    {
      "week_number": 1,
      "week_start": "2023-10-01",
      "week_end": "2023-10-07",
      "days": [
        {
          "day": 1,
          "average_measure": 95.5,
          "records_count": 2
        },
        {
          "day": 2,
          "average_measure": "Sin datos",
          "records_count": 0
        },
        {
          "day": 3,
          "average_measure": 85,
          "records_count": 1
        },
        {
          "day": 4,
          "average_measure": 92.3,
          "records_count": 3
        },
        {
          "day": 5,
          "average_measure": "Sin datos",
          "records_count": 0
        },
        {
          "day": 6,
          "average_measure": 98,
          "records_count": 1
        },
        {
          "day": 7,
          "average_measure": 94.5,
          "records_count": 2
        }
      ]
    },
    {
      "week_number": 2,
      "week_start": "2023-10-08",
      "week_end": "2023-10-14",
      "days": [
        {
          "day": 8,
          "average_measure": 96,
          "records_count": 1
        }
        // ... más días
      ]
    }
    // ... más semanas
  ]
}
```

#### Estructura de la Respuesta

| Campo                                  | Tipo                  | Descripción                                           |
| -------------------------------------- | --------------------- | ----------------------------------------------------- |
| `vital_sign`                           | Object                | Información del catálogo del signo vital              |
| `vital_sign.id`                        | number                | ID del signo vital en el catálogo                     |
| `vital_sign.name`                      | string                | Nombre del signo vital                                |
| `vital_sign.category`                  | string                | Categoría del signo vital                             |
| `vital_sign.color`                     | string \| null        | Color asociado para la UI                             |
| `vital_sign.mini_icon`                 | string \| null        | Identificador del mini icono                          |
| `vital_sign.icon`                      | string \| null        | Identificador del icono                               |
| `vital_sign.background_icon`           | string \| null        | Identificador del icono de fondo                      |
| `vital_sign.normal_min_value`          | number \| null        | Valor mínimo normal                                   |
| `vital_sign.normal_max_value`          | number \| null        | Valor máximo normal                                   |
| `vital_sign.slightly_high_value`       | number \| null        | Valor umbral ligeramente alto                         |
| `vital_sign.high_max_value`            | number \| null        | Valor máximo alto                                     |
| `vital_sign.critical_max_value`        | number \| null        | Valor máximo crítico                                  |
| `cat_measure_unit`                     | Object \| null        | Información de la unidad de medida                    |
| `cat_measure_unit.id`                  | number                | ID de la unidad de medida                             |
| `cat_measure_unit.name`                | string                | Nombre de la unidad de medida                         |
| `cat_measure_unit.description`         | string                | Descripción de la unidad de medida                    |
| `month`                                | string                | Mes solicitado en formato YYYY-MM                     |
| `monthly_stats`                        | Object                | Estadísticas del mes                                  |
| `monthly_stats.last_value`             | number \| null        | Último valor registrado en el mes                     |
| `monthly_stats.last_value_date`        | string \| null        | Fecha del último valor (ISO 8601)                     |
| `monthly_stats.max_value`              | number \| null        | Valor máximo del mes                                  |
| `monthly_stats.max_value_date`         | string \| null        | Fecha del valor máximo (ISO 8601)                     |
| `monthly_stats.min_value`              | number \| null        | Valor mínimo del mes                                  |
| `monthly_stats.min_value_date`         | string \| null        | Fecha del valor mínimo (ISO 8601)                     |
| `monthly_stats.average_value`          | number \| null        | Promedio de valores del mes                           |
| `monthly_stats.total_records`          | number                | Total de registros en el mes                          |
| `monthly_stats.alerts_count`           | number                | Cantidad de registros que superaron umbrales críticos |
| `weekly_data`                          | Array                 | Datos organizados por semanas                         |
| `weekly_data[].week_number`            | number                | Número de semana en el mes (1-6)                      |
| `weekly_data[].week_start`             | string                | Fecha de inicio de semana (domingo) YYYY-MM-DD        |
| `weekly_data[].week_end`               | string                | Fecha de fin de semana (sábado) YYYY-MM-DD            |
| `weekly_data[].days`                   | Array                 | Datos de cada día de la semana                        |
| `weekly_data[].days[].day`             | number                | Día del mes (1-31)                                    |
| `weekly_data[].days[].average_measure` | number \| "Sin datos" | Promedio de medidas del día o "Sin datos"             |
| `weekly_data[].days[].records_count`   | number                | Cantidad de registros para ese día                    |

#### Códigos de Error

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "El formato del mes debe ser YYYY-MM (ej. 2023-10)",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "El parámetro month es requerido",
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
  "message": "Tipo de signo vital no encontrado",
  "error": "Not Found"
}
```

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

### Organización Temporal

#### Estadísticas Mensuales

- **Último valor**: Basado en `created_at` más reciente
- **Máximo/Mínimo**: Valores extremos con sus fechas correspondientes
- **Promedio**: Calculado sobre todos los registros del mes
- **Alertas**: Conteo de valores que superan `critical_max_value`

#### Organización Semanal

- **Semanas**: De domingo a sábado
- **Cobertura completa**: Incluye todos los días del mes solicitado
- **Promedio diario**: Si hay múltiples registros por día, se calcula el promedio
- **Días sin datos**: Se marcan explícitamente como "Sin datos"

### Filtros Aplicados

- Solo registros no eliminados (`deleted = false`)
- Solo registros del paciente autenticado
- Solo registros del tipo de signo vital especificado
- Solo registros dentro del rango de fechas del mes solicitado

### Optimización

- Una sola consulta para obtener todos los registros del mes
- Procesamiento en memoria para estadísticas y agrupación semanal
- Redondeo a 2 decimales para promedios

## Casos de Uso

### Aplicación Móvil

Este endpoint es ideal para:

1. **Gráficos de tendencias**: Mostrar evolución temporal de un signo vital
2. **Análisis de patrones**: Identificar días/semanas con mejores/peores valores
3. **Alertas de salud**: Mostrar cuántas veces se superaron umbrales críticos
4. **Seguimiento médico**: Proporcionar datos detallados para consultas
5. **Motivación del paciente**: Mostrar progreso y estadísticas de mejora

### Integración con UI

#### Gráficos y Visualizaciones

- **Gráfico de líneas**: Usar datos semanales para mostrar tendencias
- **Gráfico de barras**: Mostrar promedios semanales o diarios
- **Indicadores**: Usar colores del catálogo para rangos de valores
- **Alertas visuales**: Destacar días con valores críticos

#### Dashboard de Salud

- **Resumen mensual**: Mostrar estadísticas principales
- **Comparación temporal**: Comparar con meses anteriores
- **Objetivos de salud**: Comparar con rangos normales del catálogo

## Seguridad

- **Autenticación obligatoria**: Solo usuarios autenticados pueden acceder
- **Autorización por paciente**: Cada paciente solo ve sus propios datos
- **Validación de parámetros**: Formato de fecha y ID de signo vital
- **Validación de tenant**: Se verifica el acceso al tenant especificado
- **Permisos granulares**: Requiere permiso específico para ver detalles del paciente

## Ejemplos de Uso

### Solicitud Básica

```bash
GET /mobile/self-evaluation-event/vital-signs/1/history?month=2023-10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
tenant-id: 123e4567-e89b-12d3-a456-426614174000
```

### Casos de Respuesta

#### Mes con Datos Completos

- Todas las estadísticas mensuales pobladas
- Múltiples semanas con datos variados
- Algunos días con múltiples registros (promediados)

#### Mes con Pocos Datos

- Estadísticas mensuales limitadas
- Muchos días marcados como "Sin datos"
- Alertas pueden ser cero

#### Mes sin Datos

- Todas las estadísticas mensuales en `null` o `0`
- Todos los días marcados como "Sin datos"
- Estructura semanal completa pero vacía
