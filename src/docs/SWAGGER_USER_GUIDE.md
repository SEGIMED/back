# 📖 Guía de Usuario - Swagger UI de SEGIMED API

## 🎯 ¿Para quién es esta guía?

Esta guía está diseñada para **desarrolladores frontend** y cualquier persona que necesite usar la API de SEGIMED pero no esté familiarizada con Swagger. Te enseñaremos paso a paso cómo usar la documentación interactiva de nuestra API.

---

## 🚀 ¿Qué es Swagger y por qué lo usamos?

**Swagger UI** es una herramienta que te permite:

- 📖 **Ver toda la documentación** de la API en un formato visual y organizado
- 🧪 **Probar endpoints directamente** desde el navegador (sin necesidad de Postman u otras herramientas)
- 🔍 **Explorar respuestas** y ver ejemplos reales
- 🛠️ **Generar código** para tu aplicación frontend

**¿Por qué es mejor que una documentación estática?**

- ✅ Siempre está actualizada con el código
- ✅ Puedes hacer pruebas reales en tiempo real
- ✅ Ver ejemplos de requests y responses
- ✅ No necesitas herramientas adicionales

---

## 🌐 Accediendo a Swagger UI

### Paso 1: Abrir Swagger UI

1. **Asegúrate de que el servidor esté corriendo** (el backend debe estar ejecutándose)
2. **Abre tu navegador** y ve a: `http://localhost:3000/api`
3. **¡Listo!** Verás la interfaz de Swagger UI

### ¿Qué verás al entrar?

```
🏥 SEGIMED API
API documentation for SEGIMED platform - a comprehensive medical management system.
Version: 1.0

[Authorize] [Servers: Local Development Server ▼]
```

---

## 🔐 Autenticación - ¡LO MÁS IMPORTANTE!

### ⚠️ **NOTA IMPORTANTE**: Solo necesitas hacer esto UNA VEZ por sesión

### Paso 1: Obtener tu Token JWT

**OPCIÓN A: Si ya tienes credenciales**

1. Ve a la sección **"Auth"** en Swagger
2. Busca el endpoint **`POST /auth`** (Login)
3. Haz clic en **"Try it out"**
4. Completa:
   ```json
   {
     "email": "tu-email@ejemplo.com",
     "password": "tu-contraseña"
   }
   ```
5. Haz clic en **"Execute"**
6. **Copia el token** de la respuesta (algo como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**OPCIÓN B: Si te dieron un token**

- Simplemente ten el token listo para el siguiente paso

### Paso 2: Autorizar en Swagger UI

1. **Busca el botón verde "Authorize"** (está en la parte superior de la página)
2. **Haz clic en "Authorize"**
3. **Se abrirá una ventana modal** con el título "Available authorizations"
4. **En el campo "Value"** escribe: `Bearer TU_TOKEN_AQUÍ`

   **Ejemplo:**

   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFyaWVsZGF2aWRyaWdoaUBnbWFpbC5jb20iLCJpZCI6IjYwODVhNGFmLWU1ZjYtNGJmNS1iZGM0LTE1YjNmMGE3NjgzMSIsIm5hbWUiOiJBcmllbCIsImxhc3RfbmFtZSI6IlJpZ2hpIiwicm9sZSI6InN1cGVyYWRtaW4iLCJpbWFnZSI6Imh0dHBzOi8vY2RuLnBpeGFiYXkuY29tL3Bob3RvLzIwMTUvMTAvMDUvMjIvMzcvYmxhbmstcHJvZmlsZS1waWN0dXJlLTk3MzQ2MF8xMjgwLnBuZyIsInRlbmFudF9pZCI6IjU0YThjZTM0LTc3ZTQtNGRmNS04ZWJhLTM0Y2I5NGRlNDE5NyIsImlhdCI6MTc1MDE3NDgzMSwiZXhwIjoxNzUwNzc5NjMxfQ.mMmGaktT214GlGdlD86TpwVh-EJdnrsCJhYpcPLXf6w
   ```

5. **Haz clic en "Authorize"**
6. **Haz clic en "Close"**

### ✅ ¿Cómo saber si estoy autenticado?

- El botón "Authorize" ahora mostrará un **ícono de candado cerrado** 🔒
- Aparecerá tu información de usuario en la parte superior

### 🎉 **¡IMPORTANTE! Ventaja de SEGIMED API**

Una vez autorizado, **NO necesitas agregar headers manuales** como `X-Tenant-ID`. Nuestra API extrae automáticamente toda la información necesaria de tu token JWT. ¡Esto hace que sea súper fácil de usar!

---

## 📚 Navegando por la Documentación

### Estructura de la Documentación

La documentación está organizada en **secciones (tags)** que agrupan funcionalidades similares:

```
🏥 SEGIMED API
├── 🔐 Auth (Autenticación)
├── 🏥 System (Health Check)
├── 👥 Users (Gestión de Usuarios)
├── 🏥 Patients (Gestión de Pacientes)
├── 📅 Appointments (Citas Médicas)
├── 📱 Mobile - Appointments (Citas Móviles)
├── 📱 Mobile Prescriptions (Prescripciones Móviles)
├── 📱 Mobile - Self-Evaluation Events (Autoevaluación)
├── 🏥 Medical Events (Eventos Médicos)
├── 💊 Medicine (Medicamentos)
├── 📋 Medical Order (Órdenes Médicas)
├── 📊 Vital Signs (Signos Vitales)
├── 🗃️ Catalogs - * (Catálogos del Sistema)
└── ⚙️ Settings (Configuraciones)
```

### ¿Cómo encontrar lo que necesitas?

1. **Busca por funcionalidad**: Si necesitas algo sobre pacientes, ve a "Patients"
2. **Identifica el tipo de operación**:
   - **GET** = Obtener/Consultar datos 📖
   - **POST** = Crear nuevos datos ➕
   - **PATCH/PUT** = Actualizar datos ✏️
   - **DELETE** = Eliminar datos 🗑️

---

## 🧪 Probando Endpoints - Tutorial Paso a Paso

### Ejemplo 1: Consultar Lista de Pacientes

**Objetivo**: Obtener la lista de todos los pacientes

#### Paso 1: Encontrar el endpoint

1. Ve a la sección **"Patients"**
2. Busca **"GET /patient"** (Obtener lista de pacientes)
3. Haz clic en el endpoint para expandirlo

#### Paso 2: Revisar la documentación

- **Descripción**: Verás para qué sirve el endpoint
- **Parameters**: Qué parámetros puedes enviar (filtros, paginación, etc.)
- **Responses**: Qué te va a devolver la API

#### Paso 3: Probar el endpoint

1. **Haz clic en "Try it out"** (botón azul)
2. **Modifica los parámetros si necesitas**:
   - `page`: Número de página (ejemplo: 1)
   - `limit`: Cuántos resultados por página (ejemplo: 10)
   - `search`: Buscar por nombre (opcional)
3. **Haz clic en "Execute"** (botón azul grande)

#### Paso 4: Ver el resultado

Verás 3 secciones importantes:

**🌐 Curl**: Comando que puedes usar en terminal

```bash
curl -X 'GET' \
  'http://localhost:3000/patient?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer tu-token...'
```

**📥 Request URL**: La URL exacta que se llamó

```
http://localhost:3000/patient?page=1&limit=10
```

**📤 Response**: La respuesta de la API

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@ejemplo.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Ejemplo 2: Crear un Nuevo Paciente

**Objetivo**: Agregar un paciente nuevo al sistema

#### Paso 1: Encontrar el endpoint

1. Ve a la sección **"Patients"**
2. Busca **"POST /patient"** (Crear paciente)
3. Haz clic para expandir

#### Paso 2: Preparar los datos

1. **Haz clic en "Try it out"**
2. **Modifica el JSON en "Request body"**:

```json
{
  "user": {
    "name": "María",
    "last_name": "González",
    "email": "maria.gonzalez@ejemplo.com",
    "dni": "12345678",
    "birth_date": "1990-05-15",
    "phone": "+549111234567",
    "identification_type_id": "tipo-dni-uuid"
  },
  "patient": {
    "medical_record_number": "MR001234"
  }
}
```

#### Paso 3: Ejecutar

1. **Haz clic en "Execute"**
2. **Revisa la respuesta**:
   - **Status Code 201**: ✅ Paciente creado exitosamente
   - **Status Code 400**: ❌ Error en los datos enviados
   - **Status Code 401**: ❌ No estás autenticado

### Ejemplo 3: Obtener Citas Móviles (Solo para Pacientes)

**Objetivo**: Ver las citas de un paciente desde la app móvil

#### Paso 1: Ir a Mobile - Appointments

1. Ve a la sección **"Mobile - Appointments"**
2. Busca **"GET /mobile/appointments"**

#### Paso 2: Entender los parámetros

- `home`: Si es `true`, solo devuelve la próxima cita. Si es `false`, devuelve todas.

#### Paso 3: Probar

1. **Haz clic en "Try it out"**
2. **Selecciona el parámetro `home`**:
   - `true` = Solo próxima cita
   - `false` = Todas las citas
3. **Haz clic en "Execute"**

**📱 Nota especial**: Este endpoint está diseñado específicamente para **pacientes**. Si eres admin/superadmin, verás un error "Esta funcionalidad es solo para pacientes" - ¡es normal!

---

## 🎨 Entendiendo las Respuestas

### Códigos de Estado HTTP Comunes

| Código     | Significado  | Qué hacer                                |
| ---------- | ------------ | ---------------------------------------- |
| **200** ✅ | OK           | Todo perfecto, tienes tu respuesta       |
| **201** ✅ | Created      | Recurso creado exitosamente              |
| **400** ❌ | Bad Request  | Revisa los datos que enviaste            |
| **401** ❌ | Unauthorized | Necesitas autenticarte o tu token expiró |
| **403** ❌ | Forbidden    | No tienes permisos para esta acción      |
| **404** ❌ | Not Found    | El recurso no existe                     |
| **500** ❌ | Server Error | Error del servidor, contacta al backend  |

### Tipos de Respuestas Exitosas

#### Lista con Paginación

```json
{
  "data": [...],          // Array con los resultados
  "pagination": {
    "page": 1,            // Página actual
    "limit": 10,          // Elementos por página
    "total": 50,          // Total de elementos
    "totalPages": 5       // Total de páginas
  }
}
```

#### Elemento Individual

```json
{
  "id": "uuid",
  "name": "Ejemplo",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Respuesta de Creación/Actualización

```json
{
  "message": "Paciente creado exitosamente",
  "data": {
    "id": "nuevo-uuid",
    "name": "Nombre del paciente"
  }
}
```

### Respuestas de Error

#### Error de Validación (400)

```json
{
  "alert": "Se han detectado los siguientes errores en la petición:",
  "errors": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ]
}
```

#### Error de Autorización (401)

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

#### Error de Permisos (403)

```json
{
  "message": "No se pudo determinar el tenant",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## 📱 Guía Específica para Endpoints Móviles

### ¿Qué son los Endpoints Móviles?

Los endpoints que empiezan con `/mobile/` están diseñados específicamente para **aplicaciones móviles de pacientes**. Tienen características especiales:

- 🎯 **Solo para pacientes**: Requieren rol de paciente
- 🔄 **Tenant automático**: No necesitas enviar headers adicionales
- 📱 **Optimizados para móvil**: Respuestas adaptadas para apps

### Endpoints Móviles Disponibles

#### 1. Mobile - Appointments (`/mobile/appointments`)

**GET /mobile/appointments**

- **Para**: Ver citas del paciente
- **Parámetros**:
  - `home=true`: Solo próxima cita
  - `home=false`: Todas las citas
- **Respuesta con `home=true`**:

```json
{
  "next_appointment": {
    "id": "uuid-cita",
    "start": "2024-01-15T10:00:00Z",
    "status": "pendiente",
    "physician": {
      "name": "Dr. Santiago",
      "specialty": "Cardiología"
    }
  }
}
```

**PATCH /mobile/appointments/{id}/cancel**

- **Para**: Cancelar una cita
- **Parámetros**: ID de la cita en la URL
- **Body**: Motivo de cancelación (opcional)

#### 2. Mobile Prescriptions (`/mobile/prescriptions`)

**GET /mobile/prescriptions**

- **Para**: Ver prescripciones del paciente
- **Incluye**: Medicamentos, dosis, horarios

**POST /mobile/prescriptions/{id}/take-medication**

- **Para**: Registrar que tomó un medicamento
- **Body**: Información de la toma

#### 3. Mobile - Self-Evaluation Events (`/mobile/self-evaluation-event`)

**GET /mobile/self-evaluation-event**

- **Para**: Ver autoevaluaciones previas

**POST /mobile/self-evaluation-event**

- **Para**: Crear nueva autoevaluación
- **Body**: Signos vitales, síntomas, estado de ánimo

---

## 🔧 Consejos Prácticos para Developers Frontend

### 1. Generar Código para tu App

**En cada endpoint**, Swagger te muestra ejemplos de código. Busca la sección **"Code samples"** o el comando **curl** para ver cómo hacer la petición.

**Ejemplo en JavaScript/Fetch**:

```javascript
fetch('http://localhost:3000/patient?page=1&limit=10', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer tu-token-jwt',
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

**Ejemplo en Axios**:

```javascript
const response = await axios.get('http://localhost:3000/patient', {
  params: { page: 1, limit: 10 },
  headers: {
    Authorization: 'Bearer tu-token-jwt',
  },
});
```

### 2. Manejar Paginación

**Siempre verifica si el endpoint tiene paginación**:

```javascript
// Función para obtener pacientes con paginación
async function getPatients(page = 1, limit = 10) {
  const response = await fetch(`/patient?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();

  return {
    patients: result.data,
    totalPages: result.pagination.totalPages,
    currentPage: result.pagination.page,
  };
}
```

### 3. Manejo de Errores

**Siempre maneja los diferentes códigos de estado**:

```javascript
async function createPatient(patientData) {
  try {
    const response = await fetch('/patient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (response.status === 201) {
      const newPatient = await response.json();
      console.log('Paciente creado:', newPatient);
      return newPatient;
    } else if (response.status === 400) {
      const errors = await response.json();
      console.error('Errores de validación:', errors);
      // Mostrar errores al usuario
    } else if (response.status === 401) {
      console.error('Token expirado, redirigir a login');
      // Redirigir a login
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}
```

### 4. Filtros y Búsquedas

**Muchos endpoints soportan filtros**. Revisa los parámetros disponibles:

```javascript
// Buscar pacientes por nombre
const searchPatients = (searchTerm) => {
  return fetch(`/patient?search=${encodeURIComponent(searchTerm)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Filtrar citas por estado
const getAppointmentsByStatus = (status) => {
  return fetch(`/appointments?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

---

## 🚨 Troubleshooting - Problemas Comunes

### Problema 1: "Unauthorized" (401)

**Causa**: Tu token JWT no es válido o ha expirado
**Solución**:

1. Vuelve a hacer login en `/auth`
2. Actualiza tu autorización en el botón "Authorize"
3. Asegúrate de incluir "Bearer " antes del token

### Problema 2: "Forbidden" (403)

**Causa**: No tienes permisos para esta acción
**Solución**:

1. Verifica que tu usuario tenga el rol correcto
2. Para endpoints móviles, asegúrate de ser un paciente
3. Contacta al administrador si crees que deberías tener acceso

### Problema 3: "Esta funcionalidad es solo para pacientes"

**Causa**: Estás usando un endpoint móvil con una cuenta que no es de paciente
**Solución**:

- Si eres admin/superadmin, usa los endpoints regulares (sin `/mobile/`)
- Si eres paciente, verifica que tu token tenga `"role": "patient"`

### Problema 4: "No se pudo determinar el tenant"

**Causa**: Problema con la configuración del tenant
**Solución**:

1. Asegúrate de estar autenticado correctamente
2. Tu token JWT debe contener `tenant_id`
3. Si el problema persiste, contacta al equipo de backend

### Problema 5: El botón "Try it out" no aparece

**Causa**: Problemas de carga de Swagger UI
**Solución**:

1. Refresca la página
2. Asegúrate de que el servidor backend esté corriendo
3. Ve a `http://localhost:3000/api` directamente

### Problema 6: Errores de Validación (400)

**Causa**: Los datos que enviaste no cumplen con las validaciones
**Solución**:

1. Revisa el mensaje de error en la respuesta
2. Verifica que todos los campos requeridos estén presentes
3. Asegúrate de que los formatos sean correctos (emails, fechas, etc.)

---

## 📋 Checklist para Developers Frontend

### Antes de Empezar

- [ ] El servidor backend está corriendo
- [ ] Puedo acceder a `http://localhost:3000/api`
- [ ] Tengo credenciales válidas o un token JWT

### Para Cada Endpoint que Voy a Usar

- [ ] He revisado la documentación del endpoint en Swagger
- [ ] Entiendo qué parámetros requiere
- [ ] He probado el endpoint en Swagger UI
- [ ] He visto la estructura de la respuesta
- [ ] He manejado los posibles códigos de error

### Para Autenticación

- [ ] He hecho login y obtenido un token JWT
- [ ] He autorizado en Swagger UI con el botón "Authorize"
- [ ] He verificado que el token funciona probando un endpoint

### Para Producción

- [ ] He cambiado las URLs de `localhost` a las URLs de producción
- [ ] He implementado manejo de errores para todos los casos
- [ ] He implementado renovación de tokens cuando expiren
- [ ] He probado con diferentes roles de usuario

---

## 📞 ¿Necesitas Ayuda?

### 🆘 Si tienes problemas técnicos:

1. **Revisa esta guía** - La mayoría de problemas comunes están cubiertos
2. **Usa la sección Troubleshooting** - Problemas específicos y soluciones
3. **Contacta al equipo de backend** - Para problemas del servidor o permisos

### 💡 Si necesitas nuevas funcionalidades:

1. **Revisa primero los endpoints existentes** - Tal vez ya existe lo que necesitas
2. **Documenta claramente tu necesidad** - Qué datos necesitas y para qué
3. **Proporciona ejemplos** - Ayuda al equipo de backend a entender el caso de uso

### 🚀 Para optimizar tu desarrollo:

1. **Usa Swagger UI como referencia** - Siempre está actualizada
2. **Implementa manejo robusto de errores** - La API te da información detallada
3. **Aprovecha la paginación** - Para listas grandes de datos
4. **Cachea responses cuando sea apropiado** - Para mejorar performance

---

## 🎉 ¡Felicidades!

Ahora tienes todo lo que necesitas para usar eficientemente la API de SEGIMED. Con esta guía podrás:

- ✅ Navegar y entender Swagger UI
- ✅ Autenticarte correctamente
- ✅ Probar endpoints interactivamente
- ✅ Implementar la API en tu aplicación frontend
- ✅ Manejar errores y problemas comunes
- ✅ Usar endpoints móviles específicos

**¡Happy coding! 🚀**

---

_Esta guía está diseñada específicamente para la API de SEGIMED. Si tienes sugerencias para mejorarla, no dudes en compartirlas con el equipo._
