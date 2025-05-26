# Permission Updater API

## Descripción general

El módulo Permission Updater proporciona herramientas administrativas para actualizar y gestionar las configuraciones de permisos a nivel de sistema. Está diseñado principalmente para ser utilizado por superadministradores para mantener actualizados los permisos predeterminados para médicos y pacientes.

## Requisitos

- **Header de Autenticación**: Bearer token JWT válido.
- **Nivel de acceso**: Solo accesible para superadministradores.
- **Guardias**: Los endpoints están protegidos por `SuperAdminGuard`.

## Endpoints

### 1. Actualizar permisos predeterminados

```http
POST /permission-updater/update-default-permissions
```

**Descripción:** Actualiza la configuración de permisos predeterminados para médicos y pacientes en el sistema.

**Respuestas:**

- `200 OK`: Permisos predeterminados actualizados exitosamente. Devuelve estadísticas del proceso de actualización.
- `403 Forbidden`: No tiene permisos de superadministrador.

## Proceso de Actualización

Cuando se invoca este endpoint, el sistema realiza las siguientes operaciones:

1. **Verificación y actualización de roles por defecto**:

   - Asegura la existencia de los roles predeterminados para médicos y pacientes.
   - Actualiza los permisos de estos roles con la lista más reciente de permisos.

2. **Actualización de asignaciones para médicos**:

   - Verifica todos los usuarios con rol de médico en el sistema.
   - Asegura que cada médico tenga asignado el rol predeterminado de médico.

3. **Actualización de asignaciones para pacientes**:
   - Verifica todos los usuarios con rol de paciente en el sistema.
   - Asegura que cada paciente tenga asignado el rol predeterminado de paciente en todos los tenants a los que pertenece.

## Respuesta de ejemplo

```json
{
  "message": "Actualización de permisos completada",
  "stats": {
    "physicians": {
      "processed": 25,
      "updated": 5,
      "rolesUpdated": 2
    },
    "patients": {
      "processed": 150,
      "updated": 20,
      "rolesUpdated": 2
    },
    "errors": 0
  }
}
```

## Notas Adicionales

- Este endpoint debe utilizarse con precaución, ya que actualiza los permisos de múltiples usuarios en el sistema.
- La operación se ejecuta de forma sincrónica y puede tardar en completarse si hay muchos usuarios en el sistema.
- Se registran eventos detallados en los logs del sistema durante el proceso de actualización.
- Solo debe ser ejecutado por superadministradores como parte de actualizaciones planificadas del sistema o correcciones de configuración.
