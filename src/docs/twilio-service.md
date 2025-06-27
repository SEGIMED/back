# Twilio Service - Documentación

## Descripción

El servicio de Twilio proporciona funcionalidades para el envío de mensajes SMS y WhatsApp, incluyendo códigos de verificación (OTP) y mensajes con archivos adjuntos. Este servicio es fundamental para las notificaciones de la plataforma SEGIMED.

## Configuración

### Variables de Entorno Requeridas

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Métodos Disponibles

### 1. `sendOtp(phoneNumber: string, otp: string)`

Envía un código de verificación (OTP) por WhatsApp a un número de teléfono específico.

#### Parámetros

- `phoneNumber` (string): Número de teléfono del destinatario en formato internacional (ej: +521234567890)
- `otp` (string): Código de verificación de un solo uso

#### Ejemplo de Uso

```typescript
await twilioService.sendOtp('+521234567890', '123456');
```

#### Mensaje Enviado

```
Tu código de verificación es: 123456
```

### 2. `sendWhatsAppWithMedia(phoneNumber: string, message: string, mediaUrl: string)`

Envía un mensaje de WhatsApp con un archivo adjunto.

#### Parámetros

- `phoneNumber` (string): Número de teléfono del destinatario en formato internacional
- `message` (string): Mensaje de texto a enviar
- `mediaUrl` (string): URL pública del archivo a adjuntar (imagen, PDF, etc.)

#### Ejemplo de Uso

```typescript
await twilioService.sendWhatsAppWithMedia(
  '+521234567890',
  'Tu receta médica está lista',
  'https://example.com/prescription.pdf',
);
```

## Casos de Uso en SEGIMED

### 1. Autenticación por OTP

```typescript
// En el proceso de registro/login
const otp = generateOTP(); // Método para generar OTP
await twilioService.sendOtp(user.phone, otp);
```

### 2. Notificaciones de Prescripciones

```typescript
// Enviar receta médica por WhatsApp
await twilioService.sendWhatsAppWithMedia(
  patient.phone,
  'Su nueva prescripción médica está disponible',
  prescriptionPdfUrl,
);
```

### 3. Recordatorios de Medicación

```typescript
// Recordatorio de toma de medicamento
await twilioService.sendWhatsAppMessage(
  patient.phone,
  `Recordatorio: Es hora de tomar ${medicationName}`,
);
```

### 4. Notificaciones de Citas

```typescript
// Confirmación de cita médica
await twilioService.sendWhatsAppWithMedia(
  patient.phone,
  'Su cita médica ha sido confirmada. Adjunto encuentra los detalles.',
  appointmentDetailsUrl,
);
```

## Formatos de Número de Teléfono

### Formato Requerido

Todos los números de teléfono deben estar en formato internacional:

```
[código_país][número_sin_espacios]
```

### Ejemplos Válidos

- México: `+521234567890`
- Estados Unidos: `+11234567890`
- España: `+34123456789`
- Argentina: `+541234567890`

## Tipos de Archivos Soportados

### WhatsApp Media Support

- **Imágenes**: JPG, JPEG, PNG, GIF
- **Documentos**: PDF
- **Videos**: MP4, 3GPP
- **Audio**: MP3, OGG, AMR

### Limitaciones

- Tamaño máximo: 16MB para documentos, 5MB para imágenes
- La URL del archivo debe ser públicamente accesible
- Los archivos deben tener HTTPS

## Manejo de Errores

### Errores Comunes

```typescript
try {
  await twilioService.sendOtp(phoneNumber, otp);
} catch (error) {
  if (error.code === 21211) {
    // Número de teléfono inválido
    throw new BadRequestException('Número de teléfono inválido');
  } else if (error.code === 21408) {
    // No se puede enviar a este número
    throw new BadRequestException('No se puede enviar mensaje a este número');
  } else {
    // Error general de Twilio
    throw new InternalServerErrorException('Error al enviar mensaje');
  }
}
```

### Códigos de Error Frecuentes

| Código | Descripción                   | Solución                                              |
| ------ | ----------------------------- | ----------------------------------------------------- |
| 21211  | Número de teléfono inválido   | Verificar formato del número                          |
| 21408  | No se puede enviar al número  | Verificar que el número esté habilitado para WhatsApp |
| 21610  | Mensaje bloqueado por filtros | Revisar contenido del mensaje                         |
| 30007  | Error de entrega              | Verificar conectividad del destinatario               |

## Integración con Otros Servicios

### Con Notification Service

```typescript
// En notification.service.ts
async sendMedicationReminder(patientId: string, medicationName: string) {
  const patient = await this.getPatient(patientId);

  if (patient.whatsapp_enabled) {
    await this.twilioService.sendOtp(
      patient.phone,
      `Recordatorio: Es hora de tomar ${medicationName}`
    );
  }
}
```

### Con Email Service

```typescript
// Estrategia de fallback
async sendNotificationWithFallback(patient: Patient, message: string) {
  try {
    await this.twilioService.sendOtp(patient.phone, message);
  } catch (error) {
    // Fallback a email si WhatsApp falla
    await this.emailService.sendNotificationEmail(patient.email, message);
  }
}
```

## Mejores Prácticas

### 1. Validación de Números

```typescript
private validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}
```

### 2. Rate Limiting

- Implementar límites de envío por usuario
- Evitar spam con cooldown periods
- Registrar intentos de envío

### 3. Logging

```typescript
// Log de eventos importantes
this.logger.log(`OTP enviado a ${phoneNumber}`);
this.logger.error(`Error enviando WhatsApp: ${error.message}`);
```

### 4. Configuración de Reintentos

```typescript
// Implementar reintentos automáticos
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await this.twilioService.sendOtp(phoneNumber, otp);
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await this.sleep(1000 * (i + 1)); // Backoff exponencial
  }
}
```

## Seguridad

### Protección de Datos

- Los tokens de Twilio se almacenan como variables de entorno
- Los números de teléfono se validan antes del envío
- Los OTP tienen tiempo de expiración limitado

### Prevención de Abuso

- Límite de intentos de envío por IP/usuario
- Validación de formato de número de teléfono
- Logging de todos los envíos para auditoría

## Monitoreo y Métricas

### Métricas Importantes

- Tasa de entrega de mensajes
- Tiempo de respuesta del servicio
- Errores por tipo
- Costo por mensaje enviado

### Dashboard de Twilio

Utilizar el dashboard de Twilio para monitorear:

- Logs de mensajes
- Estadísticas de entrega
- Costos de servicio
- Límites de la cuenta
