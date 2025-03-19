import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRoleManagerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Asigna automáticamente un rol a un usuario basado en su tipo (médico o paciente)
   * @param userId ID del usuario
   * @param userType Tipo de usuario ('physician', 'patient', etc.)
   * @param tenantId ID del tenant (opcional)
   */
  async assignDefaultRoleToUser(
    userId: string,
    userType: 'physician' | 'patient',
    tenantId?: string,
  ): Promise<void> {
    try {
      console.log(
        `Asignando rol por defecto a usuario ${userId} de tipo ${userType}`,
      );

      // Buscar el rol según el tipo de usuario
      let roleName: string;

      switch (userType) {
        case 'physician':
          roleName = 'Admin'; // Los médicos reciben rol de Admin
          break;
        case 'patient':
          roleName = 'Patient'; // Los pacientes reciben rol de Patient
          // Si no existe un rol "Patient", podemos verificar y crearlo
          await this.ensurePatientRoleExists(tenantId);
          break;
        default:
          console.log(`Tipo de usuario ${userType} no reconocido`);
          return;
      }

      // Buscar el rol en la base de datos
      const role = await this.prisma.role.findFirst({
        where: {
          name: roleName,
          tenant_id: tenantId || null,
        },
      });

      if (!role) {
        console.log(`Rol ${roleName} no encontrado`);
        return;
      }

      // Verificar si el usuario ya tiene este rol
      const existingUserRole = await this.prisma.user_role.findFirst({
        where: {
          user_id: userId,
          role_id: role.id,
        },
      });

      if (existingUserRole) {
        console.log(`El usuario ya tiene el rol ${roleName}`);
        return;
      }

      // Asignar el rol al usuario
      await this.prisma.user_role.create({
        data: {
          user_id: userId,
          role_id: role.id,
        },
      });

      console.log(`Rol ${roleName} asignado exitosamente al usuario ${userId}`);
    } catch (error) {
      console.error('Error al asignar rol al usuario:', error);
    }
  }

  /**
   * Asegura que exista un rol de tipo paciente en el sistema
   */
  private async ensurePatientRoleExists(tenantId?: string): Promise<void> {
    try {
      // Verificar si ya existe un rol de paciente
      const patientRole = await this.prisma.role.findFirst({
        where: {
          name: 'Patient',
          tenant_id: tenantId || null,
        },
      });

      // Si ya existe, no hacemos nada
      if (patientRole) {
        return;
      }

      // Crear el rol de paciente con permisos básicos de paciente
      const newRole = await this.prisma.role.create({
        data: {
          name: 'Patient',
          description: 'Rol para pacientes con acceso limitado',
          is_system: true,
          tenant_id: tenantId || null,
        },
      });

      // Obtener los permisos básicos que un paciente debería tener
      const basicPermissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: [
              'VIEW_OWN_APPOINTMENTS',
              'SCHEDULE_OWN_APPOINTMENT',
              'VIEW_OWN_MEDICAL_RECORDS',
              'SUBMIT_SELF_EVALUATION',
            ],
          },
        },
      });

      // Asignar los permisos al rol
      for (const permission of basicPermissions) {
        await this.prisma.role_permission.create({
          data: {
            role_id: newRole.id,
            permission_id: permission.id,
          },
        });
      }

      console.log('Rol Patient creado exitosamente');
    } catch (error) {
      console.error('Error al crear el rol de paciente:', error);
    }
  }
}
