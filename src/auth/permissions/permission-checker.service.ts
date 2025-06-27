import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission } from './permission.enum';

@Injectable()
export class PermissionCheckerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(
    userId: string,
    permissionName: string,
    tenantId?: string,
  ): Promise<boolean> {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      // Si el usuario es superadmin, tiene todos los permisos
      if (user.is_superadmin) {
        return true;
      }

      // Verificar si el usuario tiene el permiso a través de sus roles
      const userRoles = await this.prisma.user_role.findMany({
        where: { user_id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Si el usuario no tiene roles, no tiene permisos
      if (userRoles.length === 0) {
        return false;
      }

      // Verificar si alguno de los roles del usuario tiene el permiso solicitado
      for (const userRole of userRoles) {
        const role = userRole.role;

        // Si es un rol de sistema, aplica para todos los tenants
        // Si no es un rol de sistema, verificar que coincida el tenant
        if (role.is_system || !tenantId || role.tenant_id === tenantId) {
          // Verificar si el rol tiene el permiso
          const hasPermission = role.permissions.some(
            (rp) => rp.permission.name === permissionName,
          );

          if (hasPermission) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar permisos');
    }
  }

  /**
   * Verifica si un usuario tiene acceso a un tenant específico
   */
  async hasAccessToTenant(userId: string, tenantId: string): Promise<boolean> {
    console.log('🔍 DEBUG PermissionChecker.hasAccessToTenant: Iniciando', {
      userId,
      tenantId,
    });

    try {
      // Verificar si el usuario existe
      console.log('🔍 DEBUG PermissionChecker: Buscando usuario...');
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      console.log('🔍 DEBUG PermissionChecker: Usuario encontrado:', {
        exists: !!user,
        is_superadmin: user?.is_superadmin,
        tenant_id: user?.tenant_id,
      });

      if (!user) {
        console.log('❌ DEBUG PermissionChecker: Usuario no encontrado');
        throw new ForbiddenException('Usuario no encontrado');
      }

      // Si el usuario es superadmin, tiene acceso a todos los tenants
      if (user.is_superadmin) {
        console.log('✅ DEBUG PermissionChecker: Superadmin, acceso permitido');
        return true;
      }

      // Si el usuario pertenece al tenant, tiene acceso
      if (user.tenant_id === tenantId) {
        console.log('✅ DEBUG PermissionChecker: Usuario pertenece al tenant');
        return true;
      }

      console.log(
        '🔍 DEBUG PermissionChecker: Verificando roles del usuario...',
      );
      // Verificar si el usuario tiene roles asociados al tenant
      const userRoles = await this.prisma.user_role.findMany({
        where: { user_id: userId },
        include: {
          role: true,
        },
      });

      console.log('🔍 DEBUG PermissionChecker: Roles encontrados:', {
        count: userRoles.length,
        roles: userRoles.map((ur) => ({
          roleName: ur.role.name,
          roleTenantId: ur.role.tenant_id,
          isSystem: ur.role.is_system,
        })),
      });

      // Verificar si alguno de los roles del usuario está asociado al tenant
      const hasAccess = userRoles.some(
        (userRole) =>
          userRole.role.tenant_id === tenantId || userRole.role.is_system,
      );

      console.log('🔍 DEBUG PermissionChecker: Resultado final:', hasAccess);
      return hasAccess;
    } catch (error) {
      console.error(
        '❌ DEBUG PermissionChecker: Error en hasAccessToTenant:',
        error,
      );
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar acceso al tenant');
    }
  }

  /**
   * Verifica si un usuario es admin de un tenant específico
   */
  async isAdminOfTenant(userId: string, tenantId: string): Promise<boolean> {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      // Si el usuario es superadmin, es admin de todos los tenants
      if (user.is_superadmin) {
        return true;
      }

      // Verificar si el usuario tiene el rol de Admin en el tenant
      const userRoles = await this.prisma.user_role.findMany({
        where: { user_id: userId },
        include: {
          role: true,
        },
      });

      // Verificar si el usuario tiene el rol de Admin en el tenant
      return userRoles.some(
        (userRole) =>
          userRole.role.name === 'Admin' &&
          (userRole.role.tenant_id === tenantId || userRole.role.is_system),
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al verificar si es admin del tenant');
    }
  }

  /**
   * Obtiene todos los permisos de un usuario
   */
  async getUserPermissions(
    userId: string,
    tenantId?: string,
  ): Promise<string[]> {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }

      // Si el usuario es superadmin, tiene todos los permisos
      if (user.is_superadmin) {
        return Object.values(Permission);
      }

      // Obtener roles del usuario
      const userRoles = await this.prisma.user_role.findMany({
        where: { user_id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Recopilar permisos únicos de todos los roles aplicables
      const permissions = new Set<string>();

      for (const userRole of userRoles) {
        const role = userRole.role;

        // Si es un rol de sistema, aplica para todos los tenants
        // Si no es un rol de sistema, verificar que coincida el tenant
        if (role.is_system || !tenantId || role.tenant_id === tenantId) {
          // Agregar permisos del rol
          for (const rolePermission of role.permissions) {
            permissions.add(rolePermission.permission.name);
          }
        }
      }

      return Array.from(permissions);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Error al obtener permisos del usuario');
    }
  }
}
