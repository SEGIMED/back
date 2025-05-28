# Documentación de API: Mood

Este documento proporciona detalles sobre los endpoints del módulo de Mood (Estado de Ánimo) disponibles en la API de Segimed, específicamente diseñados para la aplicación móvil.

## Información General

- **Base URL**: `/mobile/mood`
- **Controlador**: `MoodController`
- **Servicios Relacionados**: `MoodService`
- **Autenticación**: Requiere un token Bearer de acceso JWT
- **Tenant**: Requiere un header `tenant-id` que especifica el ID del inquilino

## Descripción del Módulo

El módulo Mood permite a los pacientes registrar su estado de ánimo diario a través de la aplicación móvil. Este registro ayuda a los profesionales de la salud a monitorear el bienestar emocional de sus pacientes y a detectar posibles problemas que requieran atención.

## Limitaciones

- Los pacientes sólo pueden registrar un estado de ánimo por día.
- La escala de estados de ánimo va del 1 al 5, donde:
  - 1: Muy mal
  - 2: Mal
  - 3: Regular
  - 4: Bien
  - 5: Muy bien

## Endpoints

### 1. Registrar Estado de Ánimo

Registra el estado de ánimo actual del paciente.

- **URL**: `POST /mobile/mood`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Body**:
  ```json
  {
    "mood_level": 4
  }
  ```
- **Respuestas**:
  - `201 Created`: Estado de ánimo registrado correctamente
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "mood_level": 4,
      "created_at": "2025-05-23T10:30:00Z",
      "message": "¡Gracias por contarnos cómo te sientes hoy!"
    }
    ```
  - `409 Conflict`: Ya se ha registrado un estado de ánimo hoy
  - `401 Unauthorized`: No autorizado

### 2. Obtener Estado de Ánimo de Hoy

Devuelve el estado de ánimo registrado por el paciente en el día actual.

- **URL**: `GET /mobile/mood/today`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Respuestas**:
  - `200 OK`: Estado de ánimo obtenido correctamente
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "mood_level": 4,
      "created_at": "2025-05-23T10:30:00Z"
    }
    ```
  - `404 Not Found`: No se ha registrado ningún estado de ánimo hoy
  - `401 Unauthorized`: No autorizado

### 3. Obtener Historial de Estados de Ánimo

Devuelve el historial completo de estados de ánimo registrados por el paciente.

- **URL**: `GET /mobile/mood/history`
- **Headers**:
  - `Authorization`: Bearer token
  - `tenant-id`: ID del tenant
- **Respuestas**:
  - `200 OK`: Historial obtenido correctamente
    ```json
    [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "mood_level": 4,
        "created_at": "2025-05-23T10:30:00Z",
        "patient_id": "123e4567-e89b-12d3-a456-426614174001",
        "tenant_id": "123e4567-e89b-12d3-a456-426614174002"
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "mood_level": 3,
        "created_at": "2025-05-22T09:15:00Z",
        "patient_id": "123e4567-e89b-12d3-a456-426614174001",
        "tenant_id": "123e4567-e89b-12d3-a456-426614174002"
      }
    ]
    ```
  - `401 Unauthorized`: No autorizado

## Modelos de Datos

### CreateMoodDto

```typescript
{
  mood_level: number; // Nivel de estado de ánimo (1-5)
}
```

### MoodEntry (Modelo de Base de Datos)

```typescript
{
  id: string; // UUID único del registro
  mood_level: number; // Nivel de estado de ánimo (1-5)
  created_at: Date; // Fecha y hora de registro
  patient_id: string; // ID del paciente que registró el estado de ánimo
  tenant_id: string; // ID del tenant al que pertenece el paciente
}
```

## Uso en Aplicación Móvil

Este módulo está diseñado específicamente para ser utilizado por la aplicación móvil de Segimed. Los pacientes pueden:

1. Registrar su estado de ánimo diario
2. Ver su registro de hoy
3. Revisar su historial para observar cambios en su bienestar emocional a lo largo del tiempo

Esta información también está disponible para los profesionales de salud a través de otras interfaces, permitiéndoles monitorear el bienestar emocional de sus pacientes.
