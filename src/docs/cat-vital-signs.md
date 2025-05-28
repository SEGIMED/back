# API de Catálogo de Signos Vitales

Este módulo proporciona endpoints para gestionar el catálogo de signos vitales en la plataforma SEGIMED.

## Requisitos de Seguridad

- **Autenticación con Token Bearer**: Los endpoints de creación y eliminación requieren un token JWT válido en el header de Authorization.
- **Permisos de SuperAdmin**: Solo los endpoints de creación y eliminación requieren permisos de SuperAdmin.
- **Acceso Público**: Los endpoints de consulta (GET) son de acceso público sin requerir autenticación.

## Endpoints

### Crear un Signo Vital

```http
POST /cat-vital-signs
```

Crea un nuevo signo vital en el catálogo.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |

#### Permiso Requerido

Requiere rol de **SuperAdmin**

#### Cuerpo de la Petición

```json
{
  "name": "Frecuencia Cardíaca",
  "category": "Cardiovascular",
  "specialties": [1, 2, 3],
  "color": "#FF5733",
  "mini_icon": "heart-mini",
  "icon": "heart-icon",
  "background_icon": "heart-background",
  "normal_min_value": 60,
  "normal_max_value": 100,
  "slightly_high_value": 120,
  "high_max_value": 140,
  "critical_max_value": 180,
  "cat_measure_unit_id": 1
}
```

| Campo               | Tipo     | Descripción                                  | Requerido |
| ------------------- | -------- | -------------------------------------------- | --------- |
| name                | string   | Nombre del signo vital                       | Sí        |
| category            | string   | Categoría a la que pertenece el signo vital  | Sí        |
| specialties         | number[] | Array de IDs de especialidades relacionadas  | Sí        |
| color               | string   | Color asociado al signo vital para la UI     | Sí        |
| mini_icon           | string   | Identificador del mini icono del signo vital | Sí        |
| icon                | string   | Identificador del icono del signo vital      | Sí        |
| background_icon     | string   | Identificador del icono de fondo             | No        |
| normal_min_value    | number   | Valor mínimo normal del signo vital          | No        |
| normal_max_value    | number   | Valor máximo normal del signo vital          | No        |
| slightly_high_value | number   | Valor umbral ligeramente alto                | No        |
| high_max_value      | number   | Valor máximo alto                            | No        |
| critical_max_value  | number   | Valor máximo crítico                         | No        |
| cat_measure_unit_id | number   | ID de la unidad de medida asociada           | No        |

#### Respuesta

**Código de Estado**: 201 Created

```json
{
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
  "critical_max_value": 180,
  "specialties": [
    {
      "id": 1,
      "name": "Cardiología"
    },
    {
      "id": 2,
      "name": "Medicina General"
    }
  ],
  "cat_measure_unit": {
    "id": 1,
    "name": "bpm",
    "description": "Latidos por minuto"
  }
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Detalles de la solicitud incorrecta",
  "error": "Bad Request"
}
```

**Código de Estado**: 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Recurso prohibido",
  "error": "Forbidden"
}
```

### Obtener Todos los Signos Vitales

```http
GET /cat-vital-signs
```

Recupera una lista de todos los signos vitales, opcionalmente filtrados por IDs de especialidad.

#### Headers

No requiere headers de autenticación.

#### Permiso Requerido

No requiere permisos especiales - **Acceso público**

#### Parámetros de Consulta

| Parámetro    | Requerido | Descripción                                                   |
| ------------ | --------- | ------------------------------------------------------------- |
| specialtyIds | No        | Lista de IDs de especialidad separados por coma (ej. "1,2,3") |

#### Respuesta

**Código de Estado**: 200 OK

```json
[
  {
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
    "critical_max_value": 180,
    "specialties": [
      {
        "id": 1,
        "name": "Cardiología"
      },
      {
        "id": 2,
        "name": "Medicina General"
      }
    ],
    "cat_measure_unit": {
      "id": 1,
      "name": "bpm",
      "description": "Latidos por minuto"
    }
  },
  {
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
    "critical_max_value": 40.0,
    "specialties": [
      {
        "id": 1,
        "name": "Medicina General"
      }
    ],
    "cat_measure_unit": {
      "id": 2,
      "name": "°C",
      "description": "Grados Celsius"
    }
  }
]
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "ID de especialidad inválido: abc",
  "error": "Bad Request"
}
```

### Obtener un Signo Vital por ID

```http
GET /cat-vital-signs/{id}
```

Recupera un signo vital específico por su ID.

#### Headers

No requiere headers de autenticación.

#### Permiso Requerido

No requiere permisos especiales - **Acceso público**

#### Parámetros de Ruta

| Parámetro | Requerido | Descripción                    |
| --------- | --------- | ------------------------------ |
| id        | Sí        | ID del signo vital a consultar |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
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
  "critical_max_value": 180,
  "specialties": [
    {
      "id": 1,
      "name": "Cardiología"
    },
    {
      "id": 2,
      "name": "Medicina General"
    }
  ],
  "cat_measure_unit": {
    "id": 1,
    "name": "bpm",
    "description": "Latidos por minuto"
  }
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "ID inválido",
  "error": "Bad Request"
}
```

**Código de Estado**: 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Signo vital no encontrado",
  "error": "Not Found"
}
```

### Eliminar un Signo Vital

```http
DELETE /cat-vital-signs/{id}
```

Elimina un signo vital del catálogo.

#### Headers

| Header        | Requerido | Descripción           |
| ------------- | --------- | --------------------- |
| Authorization | Sí        | Bearer {access_token} |

#### Permiso Requerido

Requiere rol de **SuperAdmin**

#### Parámetros de Ruta

| Parámetro | Requerido | Descripción                   |
| --------- | --------- | ----------------------------- |
| id        | Sí        | ID del signo vital a eliminar |

#### Respuesta

**Código de Estado**: 200 OK

```json
{
  "message": "Signo vital con ID 1 ha sido eliminado"
}
```

**Código de Estado**: 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "ID inválido",
  "error": "Bad Request"
}
```

**Código de Estado**: 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Recurso prohibido",
  "error": "Forbidden"
}
```

## Notas

- Esta API está diseñada para gestionar los signos vitales utilizados en evaluaciones médicas
- Los signos vitales son datos de catálogo global del sistema, no están asociados a ningún tenant específico
- Los signos vitales pueden estar asociados con múltiples especialidades médicas
- Cada signo vital puede tener campos visuales como color, mini_icon, icon y background_icon para mejorar la experiencia de usuario
- Los signos vitales pueden tener múltiples rangos de valores definidos (normal, ligeramente alto, alto, crítico) para validación y alertas
- Cada signo vital puede estar asociado con una unidad de medida específica
- **Acceso público**: Los endpoints de consulta (GET) no requieren autenticación ni permisos especiales
- **Operaciones administrativas**: Solo los usuarios SuperAdmin pueden crear o eliminar signos vitales
- **Seguridad**: Los endpoints de catálogo no exponen información de pacientes, solo datos de configuración del sistema

## Campos Adicionales

### Campos Visuales

- **color**: Color hexadecimal para representar el signo vital en la interfaz de usuario
- **mini_icon**: Identificador del icono pequeño para mostrar en listas compactas
- **icon**: Identificador del icono principal para mostrar en vistas detalladas
- **background_icon**: Identificador del icono de fondo para elementos visuales especiales

### Campos de Validación y Rangos

- **normal_min_value**: Valor mínimo del rango normal para el signo vital
- **normal_max_value**: Valor máximo del rango normal para el signo vital
- **slightly_high_value**: Umbral para valores ligeramente elevados
- **high_max_value**: Valor máximo para el rango alto
- **critical_max_value**: Valor máximo crítico que requiere atención inmediata

### Relaciones

- **specialties**: Lista de especialidades médicas asociadas al signo vital
- **cat_measure_unit**: Unidad de medida asociada al signo vital (relación uno-a-uno)
- **cat_measure_unit_id**: ID de la unidad de medida asociada
