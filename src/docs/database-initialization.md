# Guía de Inicialización de Base de Datos

## 📋 Descripción

Esta guía describe el proceso completo para inicializar una base de datos nueva con todos los datos básicos necesarios para el funcionamiento del sistema SEGIMED. Incluye la creación del superadmin, tenant, catálogos, roles, permisos y configuraciones iniciales.

## 🎯 Resumen del Proceso

1. **Crear Superadmin y Tenant** → Crea el usuario administrador principal y el tenant de la organización
2. **Autenticar como Superadmin** → Obtiene el token JWT para operaciones administrativas
3. **Inicializar Catálogos** → Carga todos los catálogos médicos y del sistema
4. **Crear Roles y Permisos** → Inicializa el sistema de roles y permisos
5. **Actualizar Permisos por Defecto** → Configura permisos predeterminados para médicos y pacientes

---

## 🚀 Proceso de Inicialización Paso a Paso

### Paso 1: Crear Superadmin y Tenant

**🎯 Objetivo**: Crear el usuario superadministrador principal y el tenant de la organización.

**📋 Prerequisitos**:

- Base de datos PostgreSQL conectada
- Variables de entorno configuradas (`SUPER_ADMIN_SECRET_KEY`, `SUPER_ADMIN_TENANT_ID`)

**🔧 Endpoint**: `POST /auth/create-superadmin`

**📝 Request Body**:

```json
{
  "name": "Admin",
  "last_name": "Principal",
  "email": "admin@segimed.com",
  "password": "SuperStrongP@ss123",
  "secret_key": "superadmin"
}
```

**💡 Notas Importantes**:

- El `secret_key` debe coincidir con `SUPER_ADMIN_SECRET_KEY` en las variables de entorno
- El tenant se crea automáticamente con el ID de `SUPER_ADMIN_TENANT_ID`
- Se asignan automáticamente todos los roles y permisos al superadmin

**✅ Respuesta Exitosa**:

```json
{
  "message": "Superadmin creado exitosamente",
  "user": {
    "id": "user-uuid",
    "email": "admin@segimed.com",
    "name": "Admin",
    "last_name": "Principal",
    "role": "superadmin"
  },
  "tenant": {
    "id": "tenant-uuid",
    "type": "organization",
    "created": true
  }
}
```

**🔄 Ejemplo con cURL**:

```bash
curl -X POST https://tu-app.com/auth/create-superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "last_name": "Principal",
    "email": "admin@segimed.com",
    "password": "SuperStrongP@ss123",
    "secret_key": "superadmin"
  }'
```

---

### Paso 2: Autenticar como Superadmin

**🎯 Objetivo**: Obtener el token JWT necesario para las operaciones administrativas.

**🔧 Endpoint**: `POST /auth`

**📝 Request Body**:

```json
{
  "email": "admin@segimed.com",
  "password": "SuperStrongP@ss123"
}
```

**✅ Respuesta Exitosa**:

```json
{
  "user": {
    "id": "user-uuid",
    "name": "Admin",
    "last_name": "Principal",
    "email": "admin@segimed.com",
    "role": "superadmin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenants": [
    {
      "id": "tenant-uuid",
      "name": "Hospital General"
    }
  ]
}
```

**🔄 Ejemplo con cURL**:

```bash
curl -X POST https://tu-app.com/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@segimed.com",
    "password": "SuperStrongP@ss123"
  }'
```

**💾 Guardar Token**: Guarda el token obtenido para usarlo en los siguientes pasos.

---

### Paso 3: Inicializar Catálogos

**🎯 Objetivo**: Cargar todos los catálogos médicos y del sistema con datos predefinidos.

#### Opción A: Inicializar Todos los Catálogos (Recomendado)

**🔧 Endpoint**: `POST /catalogs/seed`

**📋 Headers Requeridos**:

```
Authorization: Bearer YOUR_JWT_TOKEN
tenant-id: YOUR_TENANT_ID
```

**📋 Catálogos que se inicializan**:

- ✅ Tipos de estudio médico
- ✅ Catálogo CIE-10 (Clasificación Internacional de Enfermedades)
- ✅ Subcatálogo CIE-10
- ✅ Signos vitales
- ✅ Unidades de medida
- ✅ Especialidades médicas
- ✅ Subsistemas físicos
- ✅ Áreas de exploración física

**🔄 Ejemplo con cURL**:

```bash
curl -X POST https://tu-app.com/catalogs/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "tenant-id: YOUR_TENANT_ID"
```

#### Opción B: Inicializar Catálogos Individuales

Si prefieres inicializar catálogos específicos, puedes usar estos endpoints:

**🔧 Tipos de Estudio**: `POST /catalogs/seed/study-types`
**🔧 CIE-10**: `POST /catalogs/seed/cie-diez`
**🔧 Subcatálogo CIE-10**: `POST /catalogs/seed/subcat-cie-diez`
**🔧 Signos Vitales**: `POST /catalogs/seed/vital-signs`
**🔧 Unidades de Medida**: `POST /catalogs/seed/measure-units`
**🔧 Especialidades**: `POST /catalogs/seed/specialties`
**🔧 Subsistemas Físicos**: `POST /catalogs/seed/physical-subsystems`
**🔧 Áreas de Exploración**: `POST /catalogs/seed/exploration-areas`

**✅ Respuesta Exitosa**:

```json
{
  "message": "Todos los catálogos han sido inicializados correctamente"
}
```

---

### Paso 4: Crear Roles y Permisos

**🎯 Objetivo**: Inicializar el sistema de roles y permisos básicos.

**🔧 Endpoint**: `POST /roles/seed`

**📋 Headers Requeridos**:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**📋 Roles que se crean**:

- ✅ **SuperAdmin** - Administrador con acceso completo al sistema
- ✅ **Admin** - Administrador de organización
- ✅ **Secretario** - Secretario con permisos limitados

**📋 Permisos incluidos**:

- ✅ Gestión de pacientes
- ✅ Gestión de médicos
- ✅ Programación de citas
- ✅ Gestión de historiales médicos
- ✅ Configuración de sistema

**🔄 Ejemplo con cURL**:

```bash
curl -X POST https://tu-app.com/roles/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**✅ Respuesta Exitosa**:

```json
{
  "message": "Roles y permisos inicializados exitosamente"
}
```

---

### Paso 5: Actualizar Permisos por Defecto

**🎯 Objetivo**: Configurar permisos predeterminados para médicos y pacientes.

**🔧 Endpoint**: `POST /permission-updater/update-default-permissions`

**📋 Headers Requeridos**:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**📋 Permisos que se configuran**:

- ✅ Permisos por defecto para médicos
- ✅ Permisos por defecto para pacientes
- ✅ Configuraciones de acceso básicas

**🔄 Ejemplo con cURL**:

```bash
curl -X POST https://tu-app.com/permission-updater/update-default-permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**✅ Respuesta Exitosa**:

```json
{
  "message": "Permisos predeterminados actualizados exitosamente"
}
```

---

## 📜 Script de Inicialización Completo

### Bash Script

```bash
#!/bin/bash

# Configuración
BASE_URL="https://tu-app.com"
SUPERADMIN_EMAIL="admin@segimed.com"
SUPERADMIN_PASSWORD="SuperStrongP@ss123"
SECRET_KEY="superadmin"

echo "🚀 Iniciando inicialización de base de datos..."

# Paso 1: Crear superadmin
echo "1️⃣ Creando superadmin..."
SUPERADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/create-superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "last_name": "Principal",
    "email": "'$SUPERADMIN_EMAIL'",
    "password": "'$SUPERADMIN_PASSWORD'",
    "secret_key": "'$SECRET_KEY'"
  }')

echo "✅ Superadmin creado: $SUPERADMIN_RESPONSE"

# Paso 2: Autenticar y obtener token
echo "2️⃣ Autenticando como superadmin..."
AUTH_RESPONSE=$(curl -s -X POST $BASE_URL/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$SUPERADMIN_EMAIL'",
    "password": "'$SUPERADMIN_PASSWORD'"
  }')

# Extraer token (requiere jq)
TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
TENANT_ID=$(echo $AUTH_RESPONSE | jq -r '.tenants[0].id')

echo "✅ Token obtenido: ${TOKEN:0:50}..."

# Paso 3: Inicializar catálogos
echo "3️⃣ Inicializando catálogos..."
CATALOGS_RESPONSE=$(curl -s -X POST $BASE_URL/catalogs/seed \
  -H "Authorization: Bearer $TOKEN" \
  -H "tenant-id: $TENANT_ID")

echo "✅ Catálogos inicializados: $CATALOGS_RESPONSE"

# Paso 4: Crear roles y permisos
echo "4️⃣ Creando roles y permisos..."
ROLES_RESPONSE=$(curl -s -X POST $BASE_URL/roles/seed \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Roles creados: $ROLES_RESPONSE"

# Paso 5: Actualizar permisos por defecto
echo "5️⃣ Actualizando permisos por defecto..."
PERMISSIONS_RESPONSE=$(curl -s -X POST $BASE_URL/permission-updater/update-default-permissions \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Permisos actualizados: $PERMISSIONS_RESPONSE"

echo "🎉 Inicialización completada exitosamente!"
```

### PowerShell Script

```powershell
# Configuración
$BASE_URL = "https://tu-app.com"
$SUPERADMIN_EMAIL = "admin@segimed.com"
$SUPERADMIN_PASSWORD = "SuperStrongP@ss123"
$SECRET_KEY = "superadmin"

Write-Host "🚀 Iniciando inicialización de base de datos..." -ForegroundColor Green

# Paso 1: Crear superadmin
Write-Host "1️⃣ Creando superadmin..." -ForegroundColor Yellow
$superadminBody = @{
    name = "Admin"
    last_name = "Principal"
    email = $SUPERADMIN_EMAIL
    password = $SUPERADMIN_PASSWORD
    secret_key = $SECRET_KEY
} | ConvertTo-Json

$superadminResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/create-superadmin" -Method Post -Body $superadminBody -ContentType "application/json"
Write-Host "✅ Superadmin creado: $($superadminResponse.message)" -ForegroundColor Green

# Paso 2: Autenticar y obtener token
Write-Host "2️⃣ Autenticando como superadmin..." -ForegroundColor Yellow
$authBody = @{
    email = $SUPERADMIN_EMAIL
    password = $SUPERADMIN_PASSWORD
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "$BASE_URL/auth" -Method Post -Body $authBody -ContentType "application/json"
$token = $authResponse.token
$tenantId = $authResponse.tenants[0].id

Write-Host "✅ Token obtenido: $($token.Substring(0, 50))..." -ForegroundColor Green

# Paso 3: Inicializar catálogos
Write-Host "3️⃣ Inicializando catálogos..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "tenant-id" = $tenantId
}

$catalogsResponse = Invoke-RestMethod -Uri "$BASE_URL/catalogs/seed" -Method Post -Headers $headers
Write-Host "✅ Catálogos inicializados: $($catalogsResponse.message)" -ForegroundColor Green

# Paso 4: Crear roles y permisos
Write-Host "4️⃣ Creando roles y permisos..." -ForegroundColor Yellow
$rolesHeaders = @{
    "Authorization" = "Bearer $token"
}

$rolesResponse = Invoke-RestMethod -Uri "$BASE_URL/roles/seed" -Method Post -Headers $rolesHeaders
Write-Host "✅ Roles creados: $($rolesResponse.message)" -ForegroundColor Green

# Paso 5: Actualizar permisos por defecto
Write-Host "5️⃣ Actualizando permisos por defecto..." -ForegroundColor Yellow
$permissionsResponse = Invoke-RestMethod -Uri "$BASE_URL/permission-updater/update-default-permissions" -Method Post -Headers $rolesHeaders
Write-Host "✅ Permisos actualizados: $($permissionsResponse.message)" -ForegroundColor Green

Write-Host "🎉 Inicialización completada exitosamente!" -ForegroundColor Green
```

---

## 🔧 Configuración de Variables de Entorno

Antes de ejecutar la inicialización, asegúrate de que estas variables estén configuradas:

```env
# Configuración de Superadmin
SUPER_ADMIN_SECRET_KEY=superadmin
SUPER_ADMIN_TENANT_ID=54a8ce34-77e4-4df5-8eba-34cb94de4197

# Configuración de Base de Datos
DATABASE_URL=postgresql://user:password@host:port/database

# Configuración de Seguridad
BCRYPT_SALT_ROUNDS=10
JWT_SECRET=estoycansadojefe
```

---

## 🚨 Consideraciones Importantes

### Seguridad

1. **Cambia las credenciales por defecto** después de la inicialización
2. **Usa contraseñas seguras** para el superadmin
3. **Mantén el SECRET_KEY seguro** y no lo compartas
4. **Usa HTTPS** en producción para todas las requests

### Orden de Ejecución

⚠️ **IMPORTANTE**: Sigue el orden exacto de los pasos:

1. Superadmin y Tenant (primero)
2. Autenticación (segundo)
3. Catálogos (tercero)
4. Roles y Permisos (cuarto)
5. Permisos por Defecto (último)

### Verificación

Después de cada paso, verifica que la respuesta sea exitosa antes de continuar.

### Troubleshooting

**Error 400**: Verifica que los datos del request sean correctos
**Error 401**: El token JWT puede haber expirado, vuelve a autenticarte
**Error 403**: Verifica que tengas permisos de superadmin
**Error 500**: Revisa los logs del servidor para más detalles

---

## 📊 Verificación del Estado

### Verificar Superadmin

```bash
curl -X GET https://tu-app.com/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Verificar Catálogos

```bash
# Verificar tipos de estudio
curl -X GET https://tu-app.com/cat-study-type

# Verificar signos vitales
curl -X GET https://tu-app.com/cat-vital-signs

# Verificar especialidades
curl -X GET https://tu-app.com/specialties
```

### Verificar Roles

```bash
curl -X GET https://tu-app.com/roles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Reinicialización

Si necesitas reinicializar la base de datos:

1. **Eliminar todos los datos** de las tablas
2. **Ejecutar migraciones** nuevamente
3. **Seguir esta guía** desde el paso 1

⚠️ **ADVERTENCIA**: La reinicialización eliminará todos los datos existentes.

---

## 📚 Referencias

- [Documentación de Auth](./auth.md)
- [Documentación de Roles](./roles.md)
- [Documentación de Catálogos](./catalog-seed.md)
- [Documentación de Permisos](./permission-updater.md)
