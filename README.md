# SEGIMED Backend API

Sistema backend para SEGIMED - Plataforma de gestión médica multiorganizacional.

## Descripción

SEGIMED es un sistema de gestión médica que permite a pacientes y médicos de múltiples organizaciones acceder y gestionar información médica de forma segura y eficiente. El sistema está construido con NestJS y soporta arquitectura multitenant.

## Características Principales

### 🏥 Gestión Multitenant

- Soporte para múltiples organizaciones
- Pacientes pueden pertenecer a varias organizaciones
- Datos médicos accesibles desde todas las organizaciones del paciente
- Aislamiento seguro de datos por tenant

### 📱 Funcionalidades Móviles

- **Citas médicas**: Visualización y cancelación de citas
- **Prescripciones**: Seguimiento de medicamentos con recordatorios
- **Signos vitales**: Auto-evaluación y seguimiento
- **Estudios médicos**: Acceso a estudios e imágenes

### 🔐 Seguridad y Autenticación

- JWT con información de tenants
- Autorización basada en permisos granulares
- Middleware automático de filtrado por tenant
- Validación de datos con class-validator

### 📊 Módulos Implementados

- **Patient Studies**: Gestión de estudios médicos (con multitenant)
- **Vital Signs**: Registro y seguimiento de signos vitales
- **Prescriptions**: Prescripciones y seguimiento de medicamentos
- **Appointments**: Sistema de citas médicas
- **Catalogs**: Gestión de catálogos del sistema
- **Mobile Functions**: APIs específicas para aplicación móvil

## Instalación del Proyecto

```bash
$ npm install
```

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/segimed_db"

# JWT
JWT_SECRET="your-jwt-secret-key"

# File Upload (optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-password"

# Twilio (optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"
```

## Ejecutar el Proyecto

```bash
# desarrollo
$ npm run start

# modo watch
$ npm run start:dev

# producción
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Nuevas Funcionalidades Implementadas ✨

### 1. CRUD Completo de Tipos de Identificación

- **Endpoints**: Full CRUD para `cat_identification_type`
- **Filtrado**: Por país con búsqueda insensible a mayúsculas
- **Autorización**: Requiere permiso `MANAGE_CATALOGS`
- **Documentación**: [Ver docs](src/docs/cat-identification-type.md)

### 2. Soporte Multitenant para Patient Studies

- **Nuevo endpoint**: `GET /patient-studies/by-patient/{patient_id}`
- **Funcionalidad**: Busca estudios en todas las organizaciones del paciente
- **Optimización**: Prioriza tenants del JWT para mejor performance
- **Documentación**: [Ver docs](src/docs/patient-studies.md)

### 3. Cancelación de Citas Móviles

- **Nuevo endpoint**: `PATCH /mobile/appointments/{appointment_id}/cancel`
- **Validaciones**: Solo citas pendientes y futuras
- **Multitenant**: Soporta pacientes en múltiples organizaciones
- **Documentación**: [Ver docs](src/docs/mobile-appointments.md)

## Arquitectura

### Estructura del Proyecto

```
src/
├── auth/                 # Autenticación y autorización
├── catalogs/             # Catálogos del sistema
├── management/           # Gestión de usuarios y pacientes
├── medical-scheduling/   # Scheduling médico y datos clínicos
├── mobile-functions/     # APIs específicas para móvil
├── prisma/               # ORM y base de datos
├── utils/                # Utilidades y middlewares
└── docs/                 # Documentación técnica
```

### Base de Datos

- **ORM**: Prisma
- **Base de datos**: PostgreSQL
- **Migraciones**: Automáticas con Prisma
- **Seeding**: Scripts de datos iniciales

## Documentación

### Documentación Técnica

- [Guía Multitenant](src/docs/MULTITENANT_GUIDE.md)
- [Patient Studies API](src/docs/patient-studies.md)
- [Mobile Appointments API](src/docs/mobile-appointments.md)
- [Mobile Patient Profile API](src/docs/mobile-patient-profile.md)
- [Catalog Identification Types API](src/docs/cat-identification-type.md)

### Swagger/OpenAPI

La documentación interactiva de la API está disponible en:

```
http://localhost:3000/api
```

## Endpoints Principales

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/refresh` - Renovar token

### Mobile APIs

- `GET /mobile/appointments` - Citas del paciente
- `PATCH /mobile/appointments/{id}/cancel` - Cancelar cita
- `GET /mobile/prescriptions/tracking` - Seguimiento de medicamentos
- `GET /vital-signs/by-patient/{id}` - Signos vitales del paciente
- `GET /patient/my-profile` - Perfil completo del paciente autenticado
- `PATCH /patient/my-profile` - Actualizar perfil del paciente autenticado

### Patient Studies

- `GET /patient-studies/by-patient/{id}` - Estudios del paciente (multitenant)
- `POST /patient-studies` - Crear nuevo estudio
- `PATCH /patient-studies/{id}` - Actualizar estudio

### Catálogos

- `GET /cat-identification-type` - Tipos de identificación
- `POST /cat-identification-type` - Crear tipo de identificación
- `GET /cat-identification-type?country=Colombia` - Filtrar por país

## Deployment

### Producción

```bash
# Build
$ npm run build

# Start production
$ npm run start:prod
```

### Docker (opcional)

```bash
# Build image
$ docker build -t segimed-backend .

# Run container
$ docker run -p 3000:3000 segimed-backend
```

## Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para detalles de cambios recientes.

## Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Soporte

Para preguntas y soporte técnico:

- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## Licencia

Este proyecto es privado y pertenece a SEGIMED.

---

**Desarrollado con ❤️ usando NestJS**
