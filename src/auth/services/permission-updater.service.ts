import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRoleManagerService } from '../roles/user-role-manager.service';
import { Permission } from '../permissions/permission.enum';

@Injectable()
export class PermissionUpdaterService {
  private readonly logger = new Logger(PermissionUpdaterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRoleManager: UserRoleManagerService,
  ) {}

  /**
   * Actualiza los permisos por defecto para médicos y pacientes
   */
  async updateDefaultPermissions() {
    this.logger.log('Iniciando actualización de permisos por defecto...');

    const stats = {
      physicians: {
        processed: 0,
        updated: 0,
        rolesUpdated: 0,
      },
      patients: {
        processed: 0,
        updated: 0,
        rolesUpdated: 0,
      },
      errors: 0,
    };

    try {
      // Paso 1: Asegurar que existan los roles por defecto y actualizar sus permisos
      this.logger.log('Verificando y actualizando roles por defecto...');

      // Obtener todos los permisos por defecto para médicos y pacientes
      const physicianPermissions = [
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
      ];

      const patientPermissions = [
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
      ];

      // Actualizar roles y permisos
      await this.userRoleManager.ensurePhysicianRoleExists();
      await this.userRoleManager.ensurePatientRoleExists();

      // Asegurar que todos los roles existentes de médicos y pacientes tengan los permisos actuales
      await this.updateExistingRolePermissions(
        'Physician',
        physicianPermissions,
        stats.physicians,
      );
      await this.updateExistingRolePermissions(
        'Patient',
        patientPermissions,
        stats.patients,
      );

      // Paso 2: Actualizar asignaciones de roles para médicos
      this.logger.log('Actualizando permisos para médicos...');
      const physicians = await this.prisma.user.findMany({
        where: { role: 'physician' },
      });

      for (const physician of physicians) {
        try {
          stats.physicians.processed++;
          // Verificar si el médico tiene el rol por defecto
          const hasRole = await this.hasDefaultRole(physician.id, 'Physician');

          if (!hasRole) {
            await this.userRoleManager.assignDefaultRoleToUser(
              physician.id,
              'physician',
              physician.tenant_id,
            );
            stats.physicians.updated++;
          }
        } catch (error) {
          this.logger.error(
            `Error al actualizar permisos del médico ${physician.id}: ${error.message}`,
          );
          stats.errors++;
        }
      }

      // Paso 3: Actualizar permisos para pacientes
      this.logger.log('Actualizando permisos para pacientes...');
      const patients = await this.prisma.user.findMany({
        where: { role: 'patient' },
        include: {
          patient: {
            include: {
              patient_tenant: true,
            },
          },
        },
      });

      for (const patient of patients) {
        try {
          stats.patients.processed++;
          // Verificar si el paciente tiene el rol por defecto
          const hasRole = await this.hasDefaultRole(patient.id, 'Patient');

          if (!hasRole) {
            // Para pacientes, necesitamos iterar sobre cada tenant al que pertenece
            if (patient.patient && patient.patient.patient_tenant) {
              for (const pt of patient.patient.patient_tenant) {
                await this.userRoleManager.assignDefaultRoleToUser(
                  patient.id,
                  'patient',
                  pt.tenant_id,
                );
              }
              stats.patients.updated++;
            }
          }
        } catch (error) {
          this.logger.error(
            `Error al actualizar permisos del paciente ${patient.id}: ${error.message}`,
          );
          stats.errors++;
        }
      }

      this.logger.log('Actualización de permisos completada');
      return {
        message: 'Actualización de permisos completada',
        stats,
      };
    } catch (error) {
      this.logger.error(`Error en proceso de actualización: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualiza los permisos de los roles existentes para asegurar que tengan todos los permisos por defecto
   */
  private async updateExistingRolePermissions(
    roleName: string,
    defaultPermissions: string[],
    stats: { processed: number; updated: number; rolesUpdated: number },
  ): Promise<void> {
    // Buscar todos los roles con el nombre especificado (pueden existir múltiples instancias por tenant)
    const roles = await this.prisma.role.findMany({
      where: {
        name: roleName,
        is_system: true,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    this.logger.log(`Encontrados ${roles.length} roles de tipo ${roleName}`);

    for (const role of roles) {
      try {
        // Obtener ids de los permisos actuales del rol
        const currentPermissionNames = role.permissions.map(
          (rp) => rp.permission.name,
        );

        // Identificar qué permisos faltan
        const missingPermissions = defaultPermissions.filter(
          (permName) => !currentPermissionNames.includes(permName),
        );

        if (missingPermissions.length > 0) {
          this.logger.log(
            `Actualizando rol ${roleName} (ID: ${role.id}) - Faltan ${missingPermissions.length} permisos`,
          );

          // Obtener los objetos de permisos faltantes
          const permissionsToAdd = await this.prisma.permission.findMany({
            where: {
              name: {
                in: missingPermissions,
              },
            },
          });

          // Agregar los permisos faltantes al rol
          for (const permission of permissionsToAdd) {
            await this.prisma.role_permission.create({
              data: {
                role_id: role.id,
                permission_id: permission.id,
              },
            });
          }

          stats.rolesUpdated++;
        }
      } catch (error) {
        this.logger.error(
          `Error al actualizar permisos del rol ${roleName} (ID: ${role.id}): ${error.message}`,
        );
      }
    }
  }

  /**
   * Verifica si un usuario tiene asignado un rol específico
   */
  private async hasDefaultRole(
    userId: string,
    roleName: string,
  ): Promise<boolean> {
    const userRoles = await this.prisma.user_role.findMany({
      where: { user_id: userId },
      include: {
        role: true,
      },
    });

    return userRoles.some((ur) => ur.role.name === roleName);
  }
}
