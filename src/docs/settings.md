# Settings Module - API Endpoints

## Descripción

El módulo de Settings proporciona endpoints para la gestión de configuraciones de pacientes, especialmente relacionadas con recordatorios de medicación y preferencias de notificaciones.

## Base URL

`/settings`

## Requerimientos de Headers

- `Authorization`: Bearer token JWT para autenticación
- `tenant_id`: ID del tenant al que pertenece el usuario

## Permisos Requeridos

- `VIEW_PATIENT_DETAILS`: Para ver configuraciones de pacientes
- `EDIT_PATIENT_INFO`: Para modificar configuraciones de pacientes

## Endpoints

### Obtener Configuraciones de Recordatorios de Paciente

**Endpoint:** `GET /settings/patient/:patient_id/reminder-settings`

**Descripción:** Obtiene las configuraciones de recordatorios de medicación para un paciente específico.

#### Parámetros de URL

- `patient_id` (string, UUID): ID único del paciente

#### Response

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "reminder_enabled": true,
  "reminder_frequency": "daily",
  "reminder_times": ["08:00", "20:00"],
  "whatsapp_enabled": true,
  "email_enabled": false,
  "push_notifications_enabled": true,
  "reminder_before_minutes": 30,
  "updated_at": "2025-06-27T10:30:00.000Z"
}
```

#### Status Codes

- `200 OK`: Configuraciones obtenidas exitosamente
- `404 Not Found`: Paciente no encontrado
- `403 Forbidden`: Sin permisos para acceder a este paciente

### Actualizar Configuraciones de Recordatorios de Paciente

**Endpoint:** `PATCH /settings/patient/:patient_id/reminder-settings`

**Descripción:** Actualiza las configuraciones de recordatorios de medicación para un paciente específico.

#### Parámetros de URL

- `patient_id` (string, UUID): ID único del paciente

#### Request Body: `UpdatePatientReminderSettingsDto`

```json
{
  "reminder_enabled": true,
  "reminder_frequency": "daily",
  "reminder_times": ["08:00", "14:00", "20:00"],
  "whatsapp_enabled": true,
  "email_enabled": false,
  "push_notifications_enabled": true,
  "reminder_before_minutes": 30
}
```

#### Campos del Request Body

| Campo                        | Tipo     | Requerido | Descripción                                       |
| ---------------------------- | -------- | --------- | ------------------------------------------------- |
| `reminder_enabled`           | boolean  | No        | Habilitar/deshabilitar recordatorios              |
| `reminder_frequency`         | string   | No        | Frecuencia de recordatorios: "daily", "weekly"    |
| `reminder_times`             | string[] | No        | Horarios de recordatorios en formato HH:MM        |
| `whatsapp_enabled`           | boolean  | No        | Habilitar notificaciones por WhatsApp             |
| `email_enabled`              | boolean  | No        | Habilitar notificaciones por email                |
| `push_notifications_enabled` | boolean  | No        | Habilitar notificaciones push                     |
| `reminder_before_minutes`    | number   | No        | Minutos antes de la toma para enviar recordatorio |

#### Response

```json
{
  "message": "Configuraciones actualizadas exitosamente",
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "updated_settings": {
    "reminder_enabled": true,
    "reminder_frequency": "daily",
    "reminder_times": ["08:00", "14:00", "20:00"],
    "whatsapp_enabled": true,
    "email_enabled": false,
    "push_notifications_enabled": true,
    "reminder_before_minutes": 30,
    "updated_at": "2025-06-27T10:35:00.000Z"
  }
}
```

#### Status Codes

- `200 OK`: Configuraciones actualizadas exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `404 Not Found`: Paciente no encontrado
- `403 Forbidden`: Sin permisos para modificar este paciente

## Ejemplos de Uso

### Obtener configuraciones de recordatorios

```bash
curl -X GET \
  'https://api.segimed.com/settings/patient/123e4567-e89b-12d3-a456-426614174000/reminder-settings' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'tenant_id: your-tenant-id'
```

### Actualizar configuraciones

```bash
curl -X PATCH \
  'https://api.segimed.com/settings/patient/123e4567-e89b-12d3-a456-426614174000/reminder-settings' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'tenant_id: your-tenant-id' \
  -H 'Content-Type: application/json' \
  -d '{
    "reminder_enabled": true,
    "reminder_times": ["08:00", "14:00", "20:00"],
    "whatsapp_enabled": true,
    "reminder_before_minutes": 15
  }'
```

## Notas Técnicas

- Las configuraciones se almacenan por paciente y son específicas de cada tenant
- Los cambios en las configuraciones afectan inmediatamente al sistema de recordatorios automáticos
- El horario de recordatorios debe estar en formato 24 horas (HH:MM)
- El sistema de recordatorios está integrado con el Medication Scheduler Service
