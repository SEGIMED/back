# NotificationService - Servicio Centralizado de Notificaciones

## Descripción General

El `NotificationService` es un servicio centralizado que maneja todas las notificaciones a pacientes en el sistema SEGIMED. Este servicio unifica la lógica de envío de emails y mensajes de WhatsApp, proporcionando una interfaz consistente para diferentes tipos de notificaciones médicas.

## Ubicación

- **Servicio**: `src/services/notification/notification.service.ts`
- **Módulo**: `src/services/notification/notification.module.ts`

## Arquitectura

### Dependencias

El `NotificationService` inyecta y utiliza:

- **EmailService**: Para el envío de correos electrónicos con plantillas HTML
- **TwilioService**: Para el envío de mensajes de WhatsApp

### Interfaces

#### `PatientNotificationData`

```typescript
interface PatientNotificationData {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_phone_verified?: boolean;
}
```

#### `MedicalOrderData`

```typescript
interface MedicalOrderData {
  id: string;
  url?: string;
  request_date: Date;
  description_type?: string;
}
```

#### `MedicalOrderTypeData`

```typescript
interface MedicalOrderTypeData {
  name: string;
  description: string;
}
```

## Métodos Principales

### `sendMedicalOrderNotification()`

Envía notificaciones para órdenes médicas de cualquier tipo.

**Firma:**

```typescript
async sendMedicalOrderNotification(
  patient: PatientNotificationData,
  order: MedicalOrderData,
  orderType: MedicalOrderTypeData,
  physicianName?: string,
  medications?: MedicationItemInterface[],
): Promise<void>
```

**Funcionalidades:**

- Determina automáticamente el tipo de plantilla según el tipo de orden
- Maneja adjuntos de archivos PDF automáticamente
- Envía por email y WhatsApp cuando están disponibles
- Gestión robusta de errores sin afectar el flujo principal

**Tipos de Orden Soportados:**

- `medication` / `medication-authorization`: Usa plantilla de medicación
- Otros tipos: Usa plantilla de orden médica general

### `sendMedicationUpdateNotification()`

Envía notificaciones específicas para actualizaciones de medicación (usado principalmente en consultas médicas).

**Firma:**

```typescript
async sendMedicationUpdateNotification(
  patient: PatientNotificationData,
  medications: MedicationItemInterface[],
  physicianName?: string,
  fileUrl?: string,
): Promise<void>
```

**Funcionalidades:**

- Optimizado para notificaciones de medicación durante consultas
- Incluye lista detallada de medicamentos prescritos
- Soporte para archivos adjuntos opcionales
- Plantillas específicas para medicación

## Plantillas de Notificación

### Email

El servicio utiliza plantillas HTML predefinidas:

- **medicationHtml**: Para notificaciones de medicación
- **medicalOrderHtml**: Para órdenes médicas generales

### WhatsApp

Mensajes de texto formateados con:

- Saludo personalizado con nombre del paciente
- Lista detallada de medicamentos (cuando aplica)
- Información del médico
- Instrucciones de seguimiento
- Firma institucional

## Gestión de Archivos Adjuntos

### Email

- Descarga automática de archivos desde URLs públicas
- Conversión a formato base64 para adjuntos
- Manejo de errores sin interrumpir el envío

### WhatsApp

- Envío de archivos multimedia usando URLs públicas
- Fallback a mensaje de texto si falla el envío con archivo

## Gestión de Errores

El servicio implementa una estrategia de gestión de errores no bloqueante:

- **Errores de Email**: Se registran pero no interrumpen el flujo
- **Errores de WhatsApp**: Se registran pero no interrumpen el flujo
- **Errores de Adjuntos**: Se continúa sin adjunto si falla la descarga
- **Logging**: Todos los errores se registran en consola para debugging

## Integración con Otros Módulos

### MedicalOrderService

```typescript
// Reemplaza el método _sendNotifications
await this.notificationService.sendMedicalOrderNotification(
  patient,
  order,
  orderType,
  physicianName,
  medications,
);
```

### MedicalEventsService

```typescript
// Reemplaza el método _sendMedicationNotification
await this.notificationService.sendMedicationUpdateNotification(
  patient,
  medications,
  physicianName,
  fileUrl,
);
```

## Configuración de Módulos

### NotificationModule

```typescript
@Module({
  imports: [EmailModule, TwilioModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
```

### Módulos que lo Utilizan

- **MedicalOrderModule**: Importa `NotificationModule`
- **MedicalEventsModule**: Importa `NotificationModule`

## Beneficios de la Centralización

### Mantenibilidad

- Lógica de notificación en un solo lugar
- Cambios en plantillas o lógica se aplican globalmente
- Fácil testing y debugging

### Consistencia

- Mismo formato y estilo en todas las notificaciones
- Gestión uniforme de errores
- Comportamiento predecible

### Reutilización

- Mismo servicio para diferentes tipos de notificaciones
- Interfaces bien definidas para diferentes casos de uso
- Fácil extensión para nuevos tipos de notificación

### Escalabilidad

- Fácil agregar nuevos canales de notificación
- Posibilidad de implementar colas de notificación
- Métricas centralizadas de envío

## Ejemplos de Uso

### Notificación de Orden Médica

```typescript
const patient = {
  id: 'patient-uuid',
  name: 'Juan',
  last_name: 'Pérez',
  email: 'juan.perez@email.com',
  phone: '+1234567890',
  is_phone_verified: true,
};

const order = {
  id: 'order-uuid',
  url: 'https://example.com/order.pdf',
  request_date: new Date(),
  description_type: 'Certificado médico',
};

const orderType = {
  name: 'certification',
  description: 'Certificado',
};

await notificationService.sendMedicalOrderNotification(
  patient,
  order,
  orderType,
  'Dr. García',
);
```

### Notificación de Medicación

```typescript
const medications = [
  {
    monodrug: 'Paracetamol',
    dose: '500',
    dose_units: 'mg',
    frecuency: 'Cada 8 horas',
    duration: '7',
    duration_units: 'días',
    observations: 'Tomar con alimentos',
  },
];

await notificationService.sendMedicationUpdateNotification(
  patient,
  medications,
  'Dr. García',
  'https://example.com/prescription.pdf',
);
```

## Consideraciones de Seguridad

- **Datos Sensibles**: No se almacenan datos de pacientes en el servicio
- **URLs Temporales**: Los archivos adjuntos deben ser accesibles públicamente
- **Validación**: Se valida la disponibilidad de email/teléfono antes del envío
- **Privacidad**: Los mensajes incluyen solo información médica necesaria

## Monitoreo y Logging

El servicio registra:

- Errores de envío de email
- Errores de envío de WhatsApp
- Errores de descarga de adjuntos
- Información de debugging para troubleshooting

## Futuras Mejoras

- **Colas de Notificación**: Para manejo de alto volumen
- **Plantillas Dinámicas**: Sistema de plantillas configurable
- **Métricas**: Tracking de tasas de entrega y apertura
- **Notificaciones Push**: Integración con aplicaciones móviles
- **Preferencias de Usuario**: Configuración de canales preferidos por paciente
