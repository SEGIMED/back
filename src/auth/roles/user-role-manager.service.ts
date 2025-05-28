import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission } from '../permissions/permission.enum';

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
          roleName = 'Physician';
          // Asegurar que existe el rol de médico
          await this.ensurePhysicianRoleExists(tenantId);
          break;
        case 'patient':
          roleName = 'Patient';
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
   * Asegura que exista un rol de tipo médico en el sistema
   */
  async ensurePhysicianRoleExists(tenantId?: string): Promise<void> {
    try {
      // Verificar si ya existe un rol de médico
      const physicianRole = await this.prisma.role.findFirst({
        where: {
          name: 'Physician',
          tenant_id: tenantId || null,
        },
      });

      // Si ya existe, no hacemos nada
      if (physicianRole) {
        return;
      }

      // Obtener los permisos básicos que un médico debería tener
      const physicianPermissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: [
              Permission.VIEW_PATIENTS_LIST,
              Permission.VIEW_PATIENT_DETAILS,
              Permission.EDIT_PATIENT_INFO,
              Permission.VIEW_DOCTORS_LIST,
              Permission.VIEW_DOCTOR_DETAILS,
              Permission.SCHEDULE_APPOINTMENTS,
              Permission.EDIT_CANCEL_APPOINTMENTS,
              Permission.CONFIRM_PATIENT_ATTENDANCE,
              Permission.ASSIGN_TREATMENTS,
              Permission.MODIFY_TREATMENTS,
              Permission.VIEW_TREATMENT_HISTORY,
              Permission.ADD_DIAGNOSES,
              Permission.EDIT_DIAGNOSES,
              Permission.VIEW_ACTIVITY_REPORTS,
              Permission.GENERATE_CONSULTATION_REPORTS,
              Permission.GENERATE_ADHERENCE_REPORTS,
              Permission.DOWNLOAD_REPORTS,
              Permission.MANAGE_USERS,
              Permission.CONFIGURE_USER_PERMISSIONS,
              Permission.CREATE_MEDICAL_ORDERS,
              Permission.EDIT_MEDICAL_ORDERS,
              Permission.DELETE_MEDICAL_ORDERS,
              Permission.VIEW_MEDICAL_ORDERS,
              Permission.UPDATE_MEDICAL_ORDERS,
            ],
          },
        },
      });

      // Crear el rol y sus permisos en una única transacción atómica
      await this.prisma.$transaction(async (tx) => {
        // Crear el rol de médico
        const newRole = await tx.role.create({
          data: {
            name: 'Physician',
            description: 'Rol para médicos con acceso a funciones médicas',
            is_system: true,
            tenant_id: tenantId || null,
          },
        });

        // Si hay permisos para asignar, crearlos todos de una vez
        if (physicianPermissions.length > 0) {
          // Preparar los datos para crear las relaciones rol-permiso
          const rolePermissionsData = physicianPermissions.map(
            (permission) => ({
              role_id: newRole.id,
              permission_id: permission.id,
            }),
          );

          // Crear todas las relaciones role_permission de una vez
          await tx.role_permission.createMany({
            data: rolePermissionsData,
          });
        }

        console.log('Rol Physician creado exitosamente');
      });
    } catch (error) {
      console.error('Error al crear el rol de médico:', error);
    }
  }

  /**
   * Asegura que exista un rol de tipo paciente en el sistema
   */
  async ensurePatientRoleExists(tenantId?: string): Promise<void> {
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

      // Obtener los permisos básicos que un paciente debería tener
      const basicPermissions = await this.prisma.permission.findMany({
        where: {
          name: {
            in: [
              Permission.VIEW_OWN_APPOINTMENTS,
              Permission.SCHEDULE_OWN_APPOINTMENT,
              Permission.VIEW_OWN_MEDICAL_RECORDS,
              Permission.SUBMIT_SELF_EVALUATION,
              Permission.VIEW_PATIENT_DETAILS,
              Permission.VIEW_MEDICAL_ORDERS,
              Permission.VIEW_TREATMENT_HISTORY,
              Permission.VIEW_DOCTORS_LIST,
              Permission.VIEW_DOCTOR_DETAILS,
              Permission.VIEW_OWN_VITAL_SIGNS,
              Permission.REGISTER_OWN_VITAL_SIGNS,
              Permission.VIEW_OWN_PRESCRIPTIONS,
              Permission.VIEW_OWN_MEDICAL_EVENTS,
            ],
          },
        },
      });

      // Crear el rol y sus permisos en una única transacción atómica
      await this.prisma.$transaction(async (tx) => {
        // Crear el rol de paciente
        const newRole = await tx.role.create({
          data: {
            name: 'Patient',
            description: 'Rol para pacientes con acceso limitado',
            is_system: true,
            tenant_id: tenantId || null,
          },
        });

        // Si hay permisos para asignar, crearlos todos de una vez
        if (basicPermissions.length > 0) {
          // Preparar los datos para crear las relaciones rol-permiso
          const rolePermissionsData = basicPermissions.map((permission) => ({
            role_id: newRole.id,
            permission_id: permission.id,
          }));

          // Crear todas las relaciones role_permission de una vez
          await tx.role_permission.createMany({
            data: rolePermissionsData,
          });
        }

        console.log('Rol Patient creado exitosamente');
      });
    } catch (error) {
      console.error('Error al crear el rol de paciente:', error);
    }
  }
}
