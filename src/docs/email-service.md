# Email Service - Documentación

## Descripción

El servicio de Email proporciona funcionalidades completas para el envío de correos electrónicos utilizando la API de Gmail. Incluye soporte para plantillas HTML, archivos adjuntos, y diferentes tipos de notificaciones médicas.

## Configuración

### Variables de Entorno Requeridas

```env
MAIL_CLIENT_ID=your_gmail_oauth_client_id
MAIL_CLIENT_SECRET=your_gmail_oauth_client_secret
MAIL_REFRESH_TOKEN=your_gmail_refresh_token
MAIL_FROM=noreply@segimed.com
```

### Configuración OAuth2 Gmail

1. Crear proyecto en Google Cloud Console
2. Habilitar Gmail API
3. Configurar OAuth2 consent screen
4. Crear credenciales OAuth2
5. Obtener refresh token

## Métodos Disponibles

### 1. `sendEmail(to: string, subject: string, htmlContent: string, attachments?: Attachment[])`

Envía un email básico con contenido HTML y archivos adjuntos opcionales.

#### Parámetros

- `to` (string): Dirección de email del destinatario
- `subject` (string): Asunto del email
- `htmlContent` (string): Contenido HTML del email
- `attachments` (Attachment[], opcional): Array de archivos adjuntos

#### Interfaz Attachment

```typescript
interface Attachment {
  filename: string;
  content: string; // Contenido en Base64
  mimeType: string;
}
```

#### Ejemplo de Uso

```typescript
await emailService.sendEmail(
  'patient@example.com',
  'Confirmación de Cita Médica',
  '<h1>Su cita ha sido confirmada</h1><p>Fecha: 27/06/2025</p>',
  [
    {
      filename: 'cita-confirmacion.pdf',
      content: 'base64-encoded-content',
      mimeType: 'application/pdf',
    },
  ],
);
```

### 2. `sendWelcomeEmail(userEmail: string, userName: string)`

Envía un email de bienvenida a nuevos usuarios registrados.

#### Parámetros

- `userEmail` (string): Email del nuevo usuario
- `userName` (string): Nombre del usuario

#### Ejemplo de Uso

```typescript
await emailService.sendWelcomeEmail('nuevo.usuario@example.com', 'Juan Pérez');
```

### 3. `sendPrescriptionEmail(patientEmail: string, prescriptionData: any, pdfBuffer: Buffer)`

Envía una prescripción médica por email con el PDF adjunto.

#### Parámetros

- `patientEmail` (string): Email del paciente
- `prescriptionData` (object): Datos de la prescripción
- `pdfBuffer` (Buffer): Buffer del PDF de la prescripción

#### Ejemplo de Uso

```typescript
const prescriptionPdf = await generatePrescriptionPdf(prescription);
await emailService.sendPrescriptionEmail(
  patient.email,
  prescription,
  prescriptionPdf,
);
```

### 4. `sendAppointmentReminder(patientEmail: string, appointmentData: any)`

Envía un recordatorio de cita médica.

#### Parámetros

- `patientEmail` (string): Email del paciente
- `appointmentData` (object): Datos de la cita médica

#### Estructura de appointmentData

```typescript
{
  patient_name: string;
  physician_name: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  location?: string;
}
```

### 5. `sendPasswordResetEmail(userEmail: string, resetToken: string)`

Envía un email para restablecer contraseña.

#### Parámetros

- `userEmail` (string): Email del usuario
- `resetToken` (string): Token de restablecimiento

### 6. `sendMedicationReminder(patientEmail: string, medicationData: any)`

Envía recordatorio de medicación por email.

#### Parámetros

- `patientEmail` (string): Email del paciente
- `medicationData` (object): Datos del medicamento

## Plantillas de Email

### Ubicación de Plantillas

Las plantillas HTML se encuentran en: `src/services/email/templates/`

### Plantillas Disponibles

1. **welcome.html** - Email de bienvenida
2. **prescription.html** - Notificación de prescripción
3. **appointment-reminder.html** - Recordatorio de cita
4. **password-reset.html** - Restablecimiento de contraseña
5. **medication-reminder.html** - Recordatorio de medicación

### Ejemplo de Plantilla (welcome.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Bienvenido a SEGIMED</title>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
      }
      .header {
        background-color: #2e86ab;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
        background-color: #f9f9f9;
      }
      .button {
        background-color: #2e86ab;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>¡Bienvenido a SEGIMED!</h1>
      </div>
      <div class="content">
        <p>Hola {{userName}},</p>
        <p>
          Te damos la bienvenida a la plataforma SEGIMED. Tu cuenta ha sido
          creada exitosamente.
        </p>
        <p>
          Ahora puedes acceder a todos nuestros servicios médicos digitales.
        </p>
        <a href="{{loginUrl}}" class="button">Iniciar Sesión</a>
      </div>
    </div>
  </body>
</html>
```

## Casos de Uso en SEGIMED

### 1. Notificación de Registro

```typescript
// Después del registro exitoso
await emailService.sendWelcomeEmail(newUser.email, newUser.name);
```

### 2. Envío de Prescripciones

```typescript
// Cuando se genera una nueva prescripción
const prescriptionPdf = await generatePrescriptionPdf(prescription);
await emailService.sendPrescriptionEmail(
  patient.email,
  prescription,
  prescriptionPdf,
);
```

### 3. Recordatorios de Citas

```typescript
// Recordatorio 24 horas antes de la cita
await emailService.sendAppointmentReminder(patient.email, {
  patient_name: patient.name,
  physician_name: physician.name,
  appointment_date: '27/06/2025',
  appointment_time: '10:30',
  consultation_type: 'Consulta General',
});
```

### 4. Restablecimiento de Contraseña

```typescript
// Cuando el usuario solicita restablecer contraseña
const resetToken = generateResetToken();
await emailService.sendPasswordResetEmail(user.email, resetToken);
```

### 5. Recordatorios de Medicación

```typescript
// Recordatorio diario de medicación
await emailService.sendMedicationReminder(patient.email, {
  medication_name: 'Ibuprofeno 400mg',
  dosage: '1 tableta',
  frequency: 'Cada 8 horas',
  next_dose_time: '14:00',
});
```

## Manejo de Archivos Adjuntos

### Convertir Buffer a Base64

```typescript
const base64Content = buffer.toString('base64');
const attachment: Attachment = {
  filename: 'document.pdf',
  content: base64Content,
  mimeType: 'application/pdf',
};
```

### Tipos MIME Soportados

| Tipo de Archivo | MIME Type                                                               |
| --------------- | ----------------------------------------------------------------------- |
| PDF             | application/pdf                                                         |
| Word Doc        | application/msword                                                      |
| Word Docx       | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Excel           | application/vnd.ms-excel                                                |
| Imagen JPG      | image/jpeg                                                              |
| Imagen PNG      | image/png                                                               |
| Texto           | text/plain                                                              |

### Límites de Archivos

- Tamaño máximo por archivo: 25MB
- Número máximo de archivos: 10 por email
- Tamaño total máximo: 25MB

## Manejo de Errores

### Errores Comunes

```typescript
try {
  await emailService.sendEmail(to, subject, content);
} catch (error) {
  if (error.code === 'EAUTH') {
    // Error de autenticación OAuth
    throw new UnauthorizedException('Error de autenticación con Gmail');
  } else if (error.code === 'ENOTFOUND') {
    // Error de conectividad
    throw new ServiceUnavailableException('Servicio de email no disponible');
  } else if (error.message.includes('quota')) {
    // Límite de cuota excedido
    throw new TooManyRequestsException('Límite de envío excedido');
  } else {
    throw new InternalServerErrorException('Error al enviar email');
  }
}
```

### Validación de Email

```typescript
private validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

## Integración con Otros Servicios

### Con Notification Service

```typescript
// Estrategia multi-canal
async sendNotification(patient: Patient, message: string, type: string) {
  const promises = [];

  if (patient.email_notifications_enabled) {
    promises.push(this.emailService.sendEmail(
      patient.email,
      `SEGIMED - ${type}`,
      message
    ));
  }

  if (patient.whatsapp_notifications_enabled) {
    promises.push(this.twilioService.sendOtp(patient.phone, message));
  }

  await Promise.allSettled(promises);
}
```

### Con Medication Scheduler

```typescript
// Recordatorios automáticos
@Cron(CronExpression.EVERY_DAY_AT_8AM)
async sendDailyMedicationReminders() {
  const patients = await this.getPatientsWithMedication();

  for (const patient of patients) {
    if (patient.email_reminders_enabled) {
      await this.emailService.sendMedicationReminder(
        patient.email,
        patient.current_medications
      );
    }
  }
}
```

## Mejores Prácticas

### 1. Templates Responsivos

```html
<!-- Usar media queries para dispositivos móviles -->
<style>
  @media only screen and (max-width: 600px) {
    .container {
      width: 100% !important;
    }
    .content {
      padding: 10px !important;
    }
  }
</style>
```

### 2. Personalización de Contenido

```typescript
// Reemplazar variables en plantillas
private replaceTemplateVariables(template: string, data: any): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}
```

### 3. Rate Limiting

```typescript
// Implementar límites de envío
private readonly emailQueue = new Map<string, number>();

async sendEmailWithRateLimit(to: string, subject: string, content: string) {
  const dailyLimit = 50;
  const today = new Date().toDateString();
  const key = `${to}-${today}`;

  const count = this.emailQueue.get(key) || 0;
  if (count >= dailyLimit) {
    throw new TooManyRequestsException('Límite diario de emails excedido');
  }

  await this.sendEmail(to, subject, content);
  this.emailQueue.set(key, count + 1);
}
```

### 4. Logging y Monitoreo

```typescript
// Log detallado de envíos
this.logger.log(`Email enviado a ${to}, asunto: ${subject}`);
this.logger.error(`Error enviando email a ${to}: ${error.message}`);

// Métricas de envío
this.metricsService.incrementCounter('emails_sent');
this.metricsService.recordDuration('email_send_time', duration);
```

## Seguridad

### Protección de Datos

- Tokens OAuth almacenados como variables de entorno
- Validación de direcciones de email
- Sanitización de contenido HTML
- Encriptación de archivos adjuntos sensibles

### Prevención de Spam

- Rate limiting por usuario y IP
- Validación de destinatarios
- Lista de emails bloqueados
- Verificación de dominios válidos

### Cumplimiento GDPR

- Consentimiento explícito para emails de marketing
- Opción de unsubscribe en todos los emails
- Retención limitada de logs de envío
- Encriptación de datos personales

## Monitoreo y Métricas

### KPIs Importantes

- Tasa de entrega de emails
- Tasa de apertura
- Tasa de click-through
- Errores por tipo
- Tiempo de envío promedio

### Dashboard de Gmail API

Monitorear:

- Cuota de envío utilizada
- Errores de autenticación
- Límites de API
- Estadísticas de uso
