import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission } from '../permissions/permission.enum';

interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  tenantId?: string;
  isSystem?: boolean;
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async seedDefaultRoles() {
    const defaultRoles = [
      {
        name: 'SuperAdmin',
        description: 'Administrador con acceso completo al sistema',
        isSystem: true,
        permissions: Object.values(Permission),
      },
      {
        name: 'Admin',
        description: 'Administrador de organización',
        isSystem: true,
        permissions: Object.values(Permission),
      },
      {
        name: 'Secretario',
        description: 'Secretario con permisos limitados',
        isSystem: true,
        permissions: [
          Permission.VIEW_DOCTORS_LIST,
          Permission.VIEW_DOCTOR_DETAILS,
          Permission.VIEW_PATIENTS_LIST,
          Permission.VIEW_PATIENT_DETAILS,
          Permission.SCHEDULE_APPOINTMENTS,
          Permission.EDIT_CANCEL_APPOINTMENTS,
          Permission.CONFIRM_PATIENT_ATTENDANCE,
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.prisma.role.findFirst({
        where: { name: roleData.name, is_system: true },
      });

      if (!existingRole) {
        await this.createRole({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystem: roleData.isSystem,
        });
      }
    }

    return this.prisma.role.findMany({
      where: { is_system: true },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async createRole(data: CreateRoleDto) {
    try {
      const permissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: data.permissions,
          },
        },
      });

      if (permissions.length !== data.permissions.length) {
        throw new BadRequestException('Algunos permisos no existen');
      }

      // Crear el rol y asignar permisos en una única transacción atómica
      return await this.prisma.$transaction(async (tx) => {
        // Crear el rol
        const role = await tx.role.create({
          data: {
            name: data.name,
            description: data.description,
            is_system: data.isSystem || false,
            tenant_id: data.tenantId,
          },
        });

        // Preparar los datos para crear las relaciones rol-permiso
        const rolePermissionsData = permissions.map((permission) => ({
          role_id: role.id,
          permission_id: permission.id,
        }));

        // Crear todas las relaciones role_permission de una vez
        await tx.role_permission.createMany({
          data: rolePermissionsData,
        });

        return role;
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el rol: ${error.message}`);
    }
  }

  async getRoles(tenantId?: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [{ tenant_id: tenantId }, { is_system: true }],
        deleted: false,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async updateRole(id: string, data: UpdateRoleDto) {
    try {
      const role = await this.getRoleById(id);

      if (role.is_system) {
        throw new BadRequestException(
          'No se pueden modificar roles del sistema',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        // Actualizar datos básicos del rol
        const updatedRole = await tx.role.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
          },
        });

        // Si se proporcionan permisos, actualizar los permisos del rol
        if (data.permissions) {
          // Verificar que los permisos existan
          const permissions = await tx.permission.findMany({
            where: {
              name: {
                in: data.permissions,
              },
            },
          });

          if (permissions.length !== data.permissions.length) {
            throw new BadRequestException('Algunos permisos no existen');
          }

          // Eliminar permisos actuales
          await tx.role_permission.deleteMany({
            where: { role_id: id },
          });

          // Asociar nuevos permisos
          for (const permission of permissions) {
            await tx.role_permission.create({
              data: {
                role_id: id,
                permission_id: permission.id,
              },
            });
          }
        }

        return updatedRole;
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar el rol: ${error.message}`,
      );
    }
  }

  async deleteRole(id: string) {
    try {
      const role = await this.getRoleById(id);

      if (role.is_system) {
        throw new BadRequestException(
          'No se pueden eliminar roles del sistema',
        );
      }

      // Verificar si hay usuarios con este rol
      const usersWithRole = await this.prisma.user_role.findMany({
        where: { role_id: id },
      });

      if (usersWithRole.length > 0) {
        throw new BadRequestException(
          'No se puede eliminar un rol asignado a usuarios',
        );
      }

      // Eliminar el rol y sus permisos asociados
      return this.prisma.$transaction(async (tx) => {
        // Eliminar permisos del rol
        await tx.role_permission.deleteMany({
          where: { role_id: id },
        });

        // Eliminar el rol
        return tx.role.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar el rol: ${error.message}`,
      );
    }
  }

  async assignRoleToUser(userId: string, roleId: string) {
    try {
      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      // Verificar si el rol existe
      /*     const role = await this.getRoleById(roleId); */

      // Verificar si el usuario ya tiene este rol
      const existingUserRole = await this.prisma.user_role.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
        },
      });

      if (existingUserRole) {
        throw new BadRequestException('El usuario ya tiene asignado este rol');
      }

      // Asignar rol al usuario
      return this.prisma.user_role.create({
        data: {
          user_id: userId,
          role_id: roleId,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al asignar rol al usuario: ${error.message}`,
      );
    }
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    try {
      const userRole = await this.prisma.user_role.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
        },
      });
      if (!userRole) {
        throw new NotFoundException('El usuario no tiene asignado este rol');
      }

      // Eliminar la relación
      return this.prisma.user_role.delete({
        where: { id: userRole.id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar rol del usuario: ${error.message}`,
      );
    }
  }

  async getUserRoles(userId: string) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Obtener roles del usuario
    return this.prisma.user_role.findMany({
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
  }
}
