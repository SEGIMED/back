# Manual de Introducción a Segimed Backend para Desarrolladores

## Índice

1. Introducción y Visión General
2. Arquitectura del Sistema
3. Estructura del Proyecto
4. Modelo de Datos
5. Sistema Multi-Tenant
6. Autenticación y Autorización
7. Principales Módulos y Funcionalidades
8. Flujos de Trabajo Comunes
9. Configuración del Entorno de Desarrollo
10. Convenciones de Código
11. Recursos y Documentación

---

## 1. Introducción y Visión General

Segimed es una plataforma de gestión médica integral desarrollada para facilitar la administración de clínicas, consultorios médicos y profesionales de la salud. El sistema permite gestionar pacientes, citas, historias clínicas, recetas, certificados y órdenes médicas en un entorno seguro y organizado.

**Objetivos principales de la aplicación:**

- Gestión completa de pacientes y sus historias clínicas
- Agendamiento y gestión de citas médicas
- Generación de documentos médicos (recetas, certificados, órdenes de estudios)
- Administración de médicos y sus especialidades
- Dashboard con estadísticas e indicadores

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico

- **Backend**: NestJS (Framework de Node.js)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación API**: Swagger
- **Almacenamiento de archivos**: Cloudinary
- **Notificaciones**: Twilio y servicio de Email
- **Integración de pagos**: PayPal

### 2.2 Patrón Arquitectónico

Segimed implementa una arquitectura modular basada en los principios de NestJS:

- **Módulos**: Unidades funcionales independientes y reutilizables
- **Controladores**: Gestionan las rutas HTTP y solicitudes entrantes
- **Servicios**: Encapsulan la lógica de negocio
- **DTOs**: Objetos de transferencia de datos para validación
- **Entidades**: Representan el modelo de datos

## 3. Estructura del Proyecto

El proyecto está organizado en los siguientes directorios principales:

```
src/
  |- app.module.ts             # Módulo principal de la aplicación
  |- main.ts                   # Punto de entrada de la aplicación
  |- auth/                     # Autenticación y autorización
  |- catalogs/                 # Catálogos del sistema (ej. CIE-10, tipos de estudios)
  |- management/               # Gestión de usuarios, pacientes y suscripciones
  |- medical_order/            # Gestión de órdenes médicas
  |- medical-scheduling/       # Agendamiento médico y eventos
  |- mobile-functions/         # Funciones para aplicaciones móviles
  |- prisma/                   # Configuración de Prisma ORM
  |- services/                 # Servicios externos (email, Twilio)
  |- utils/                    # Utilidades y helpers
```

## 4. Modelo de Datos

Segimed utiliza Prisma como ORM para interactuar con la base de datos PostgreSQL. Las principales entidades del sistema son:

- **tenant**: Representa organizaciones o clínicas independientes
- **user**: Usuarios del sistema (médicos, administrativos, etc.)
- **patient**: Pacientes registrados
- **physician**: Médicos asociados al sistema
- **appointment**: Citas médicas
- **medical_event**: Eventos médicos (consultas)
- **prescription**: Recetas médicas
- **medical_order**: Órdenes médicas (estudios, certificados)

El esquema completo se encuentra definido en schema.prisma.

## 5. Sistema Multi-Tenant

Segimed implementa un modelo multi-tenant para dar servicio a múltiples organizaciones médicas de forma independiente:

- Cada organización (clínica, hospital, consultorio) está representada por un tenant
- Los datos están lógicamente separados por tenant
- Se implementan middlewares específicos (`TenantMiddleware`, `TenantExtractorMiddleware`) para gestionar el contexto del tenant en cada solicitud
- La seguridad se refuerza mediante el `TenantAccessGuard` que verifica los permisos a nivel de tenant

## 6. Autenticación y Autorización

### 6.1 Autenticación

- Basada en JWT (JSON Web Tokens)
- Rutas de autenticación en `/auth`
- Soporte para login con credenciales y Google Auth
- Recuperación de contraseña mediante OTP

### 6.2 Sistema de Permisos

- Sistema granular basado en permisos específicos (definidos en permission.enum.ts)
- Roles predefinidos (médico, administrativo, etc.)
- Guards personalizados para verificar permisos (`PermissionGuard`)
- Decoradores para facilitar la verificación de permisos (`@RequirePermission()`)

## 7. Principales Módulos y Funcionalidades

### 7.1 Gestión de Pacientes

- CRUD completo de pacientes
- Gestión de historias clínicas
- Vinculación con tenants

### 7.2 Agendamiento Médico

- Programación de citas
- Gestión de horarios de médicos
- Confirmaciones y recordatorios

### 7.3 Órdenes Médicas

El sistema permite generar tres tipos de documentos médicos:

1. **Autorizaciones de estudios** (tipo `study-authorization`):

   - Solicitud de estudios diagnósticos como resonancias, radiografías, etc.
   - Asociado a un diagnóstico CIE-10

2. **Certificados médicos** (tipo `certification`):

   - Documentos que certifican condición médica, ausencias, etc.
   - Vinculados a diagnósticos CIE-10

3. **Recetas médicas** (tipo `medication`):
   - Prescripción de uno o más medicamentos
   - Incluye dosis, frecuencia, duración y observaciones

Ejemplo de formato para órdenes médicas (enviar como form-data con archivo adjunto):

```json
{
  "type": "study-authorization",
  "form_data": {
    "patient_id": "123e4567-e89b-12d3-a456-426614174000",
    "cat_study_type_id": 1,
    "request_reason": "Se requiere resonancia magnética para evaluar lesión en rodilla",
    "description_type": "Resonancia Magnética de Rodilla",
    "application_date": "2023-12-01T10:00:00Z",
    "category_cie_diez_id": 45
  }
}
```

### 7.4 Historia Clínica

- Registro de signos vitales
- Exploración física por áreas
- Antecedentes médicos
- Diagnósticos con codificación CIE-10

## 8. Flujos de Trabajo Comunes

### 8.1 Creación de una Orden Médica

1. Seleccionar paciente
2. Determinar tipo de orden (estudio, certificado, receta)
3. Completar formulario específico según tipo
4. Adjuntar archivo relacionado (opcional)
5. Enviar mediante POST a `/medical-order?type={tipo}`

### 8.2 Agendamiento de Citas

1. Verificar disponibilidad del médico
2. Crear cita mediante endpoint de appointments
3. Asociar paciente y médico
4. Definir fecha, hora y duración

### 8.3 Registro de Consulta Médica

1. Crear evento médico
2. Registrar signos vitales
3. Documentar exploración física
4. Establecer diagnóstico(s)
5. Generar órdenes médicas necesarias

## 9. Configuración del Entorno de Desarrollo

### 9.1 Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn
- Git

### 9.2 Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Crear archivo `.env` basado en `.env.example`
4. Configurar conexión a la base de datos en `.env`
5. Generar cliente Prisma: `npm run prisma`
6. Iniciar servidor en modo desarrollo: `npm run start:dev`

### 9.3 Variables de Entorno Esenciales

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `CLOUDINARY_*`: Credenciales de Cloudinary
- `TWILIO_*`: Credenciales de Twilio
- `EMAIL_*`: Configuración del servicio de email

## 10. Convenciones de Código

### 10.1 Estructura de Módulos

Cada módulo funcional debe seguir la estructura:

- `*.module.ts`: Definición del módulo
- `*.controller.ts`: Controlador con endpoints
- `*.service.ts`: Servicio con lógica de negocio
- `dto/`: Objetos de transferencia de datos
- `entities/`: Entidades relacionadas

### 10.2 Nomenclatura

- **Clases**: PascalCase
- **Métodos y variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Archivos**: kebab-case

### 10.3 Documentación

- Documentar endpoints con decoradores de Swagger
- Comentar funciones complejas
- Mantener README actualizado

## 11. Recursos y Documentación

### 11.1 Documentación Interna

- Swagger UI: Disponible en `/api` cuando el servidor está en ejecución
- Ejemplos de uso: Directorio examples

### 11.2 Documentación Externa

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Authentication](https://jwt.io/introduction)

### 11.3 Archivos de Ejemplo

El directorio examples contiene ejemplos de los diferentes tipos de solicitudes y formatos JSON utilizados en la aplicación, como:

- medical-files.json: Ejemplos de órdenes médicas
- `medical-prescriptions.json`: Ejemplos de recetas
- `patient-study-base64.json`: Ejemplos con archivos codificados en base64

---
