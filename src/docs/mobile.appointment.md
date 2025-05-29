# Mobile Appointments API

Este módulo proporciona endpoints optimizados para aplicaciones móviles para gestionar las citas de pacientes.

## Endpoints

### GET `/mobile/appointments`

Obtiene las citas del paciente autenticado según el parámetro `home`.

#### Parámetros Query

- `home` (boolean, opcional):
  - `true`: Devuelve solo la próxima cita pendiente del paciente
  - `false` o no especificado: Devuelve todas las citas agrupadas por estado (pendientes/pasadas)

#### Autenticación

- Requiere Bearer token en el header `Authorization`
- Solo funciona para usuarios con rol `patient`
- Automáticamente considera todos los tenants asociados al paciente según su JWT

#### Headers

- `Authorization: Bearer <token>` (requerido)
- `x-tenant-id: <tenant_id>` (opcional, para especificar un tenant específico)

#### Respuestas

##### Cuando `home=true` - Próxima cita

```json
{
  "next_appointment": {
    "id": "uuid",
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T11:00:00Z",
    "status": "pendiente",
    "physician": {
      "id": "uuid",
      "name": "Dr. Juan",
      "surname": "Pérez",
      "specialties": ["Cardiología"]
    },
    "tenant": {
      "id": "uuid",
      "name": "Hospital Central"
    },
    "notes": "Revisión mensual"
  },
  "message": "Próxima cita encontrada exitosamente"
}
```

##### Cuando `home=false` - Todas las citas

```json
{
  "appointments": {
    "pending": [
      {
        "id": "uuid",
        "start": "2024-01-15T10:00:00Z",
        "end": "2024-01-15T11:00:00Z",
        "status": "pendiente",
        "physician": {
          "id": "uuid",
          "name": "Dr. Juan",
          "surname": "Pérez",
          "specialties": ["Cardiología"]
        },
        "tenant": {
          "id": "uuid",
          "name": "Hospital Central"
        },
        "notes": "Revisión mensual"
      }
    ],
    "past": [
      {
        "id": "uuid",
        "start": "2024-01-01T10:00:00Z",
        "end": "2024-01-01T11:00:00Z",
        "status": "atendida",
        "physician": {
          "id": "uuid",
          "name": "Dr. María",
          "surname": "González",
          "specialties": ["Medicina General"]
        },
        "tenant": {
          "id": "uuid",
          "name": "Clínica Norte"
        }
      }
    ],
    "pending_count": 1,
    "past_count": 1
  },
  "message": "Citas obtenidas exitosamente"
}
```

#### Códigos de Estado

- `200 OK`: Operación exitosa
- `400 Bad Request`: Error en la solicitud o datos inválidos
- `401 Unauthorized`: Token inválido o faltante
- `403 Forbidden`: No tiene permisos para acceder
- `404 Not Found`: Paciente no encontrado

## Lógica de Multi-Tenant para Pacientes

El sistema maneja automáticamente pacientes asociados a múltiples organizaciones (tenants):

1. **JWT Token**: El token JWT del paciente incluye un array `tenants` con todas las organizaciones asociadas
2. **Tenant Específico**: Si se envía el header `x-tenant-id`, se filtran solo las citas de esa organización (si el paciente tiene acceso)
3. **Todos los Tenants**: Si no se especifica tenant, se obtienen citas de todas las organizaciones asociadas al paciente
4. **Validación**: El sistema verifica que el paciente tenga acceso a los tenants solicitados

## Permisos Requeridos

- `VIEW_OWN_APPOINTMENTS`: Permiso para ver las citas propias del paciente

## Ejemplo de Uso

### Obtener próxima cita (para pantalla de inicio)

```bash
curl -X GET "https://api.example.com/mobile/appointments?home=true" \
  -H "Authorization: Bearer <jwt_token>"
```

### Obtener todas las citas (para pantalla de historial)

```bash
curl -X GET "https://api.example.com/mobile/appointments" \
  -H "Authorization: Bearer <jwt_token>"
```

### Obtener citas de una organización específica

```bash
curl -X GET "https://api.example.com/mobile/appointments" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "x-tenant-id: <tenant_uuid>"
```
