import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission } from './permission.enum';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async seedPermissions() {
    // Obtener todos los permisos existentes
    const existingPermissions = await this.prisma.permission.findMany();
    const existingPermissionNames = existingPermissions.map((p) => p.name);

    // Crear permisos que no existen
    const permissionsToCreate = Object.values(Permission)
      .filter((permission) => !existingPermissionNames.includes(permission))
      .map((permission) => ({
        name: permission,
        description: this.getPermissionDescription(permission),
      }));

    if (permissionsToCreate.length > 0) {
      await this.prisma.permission.createMany({
        data: permissionsToCreate,
        skipDuplicates: true,
      });
    }

    return this.prisma.permission.findMany();
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getPermissionById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permission;
  }

  async getPermissionByName(name: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con nombre ${name} no encontrado`);
    }

    return permission;
  }

  private getPermissionDescription(permissionName: string): string {
    const descriptions = {
      [Permission.VIEW_DOCTORS_LIST]: 'Ver listado de médicos',
      [Permission.VIEW_DOCTOR_DETAILS]: 'Ver detalles de médico',
      [Permission.EDIT_DOCTOR_INFO]: 'Editar información de médico',
      [Permission.DELETE_DOCTORS]: 'Eliminar médicos',
      [Permission.ACCESS_DOCTOR_INDICATORS]:
        'Acceder a indicadores de médicos (consultas atendidas, rendimiento, calificación, etc.)',

      [Permission.VIEW_PATIENTS_LIST]: 'Ver listado de pacientes',
      [Permission.VIEW_PATIENT_DETAILS]: 'Ver detalles de paciente',
      [Permission.EDIT_PATIENT_INFO]: 'Editar información de paciente',
      [Permission.DELETE_PATIENTS]: 'Eliminar pacientes',
      [Permission.ACCESS_PATIENT_INDICATORS]:
        'Acceder a indicadores del paciente (estadísticas, adherencia, alarmas, etc.)',

      [Permission.ASSIGN_TREATMENTS]: 'Asignar tratamientos a pacientes',
      [Permission.MODIFY_TREATMENTS]: 'Modificar tratamientos asignados',
      [Permission.VIEW_TREATMENT_HISTORY]: 'Ver historial de tratamientos',
      [Permission.ADD_DIAGNOSES]: 'Agregar diagnósticos médicos',
      [Permission.EDIT_DIAGNOSES]: 'Editar diagnósticos',

      [Permission.VIEW_ACTIVITY_REPORTS]:
        'Ver reportes de actividad (médicos y pacientes)',
      [Permission.GENERATE_CONSULTATION_REPORTS]:
        'Generar reportes de consultas atendidas',
      [Permission.GENERATE_ADHERENCE_REPORTS]:
        'Generar reportes de adherencia al tratamiento',
      [Permission.DOWNLOAD_REPORTS]: 'Descargar reportes en PDF o Excel',
      [Permission.VIEW_STATISTICS]: 'Ver estadísticas y gráficos del sistema',

      [Permission.MANAGE_USERS]:
        'Gestión de usuarios (crear, editar, eliminar roles)',
      [Permission.CONFIGURE_USER_PERMISSIONS]:
        'Configuración de permisos de usuarios',
      [Permission.DEFINE_STATISTICS_ACCESS]:
        'Definir acceso a estadísticas y reportes',
      [Permission.CONFIGURE_ALERTS]:
        'Configuración de alertas y notificaciones',
      [Permission.MANAGE_SPECIALTIES]: 'Gestión de especialidades médicas',

      [Permission.SCHEDULE_APPOINTMENTS]: 'Agendar consultas para pacientes',
      [Permission.EDIT_CANCEL_APPOINTMENTS]: 'Editar y cancelar citas',
      [Permission.CONFIRM_PATIENT_ATTENDANCE]:
        'Confirmar asistencia del paciente',
      [Permission.BLOCK_SCHEDULE]: 'Bloquear horarios en la agenda',
      [Permission.AUTOMATIC_REMINDERS]: 'Recordatorios automáticos de citas',

      [Permission.MANAGE_CATALOGS]: 'Gestionar catálogos del sistema',

      [Permission.VIEW_OWN_MEDICAL_RECORDS]: 'Ver historial médico propio',
      [Permission.DELETE_OWN_MEDICAL_RECORDS]:
        'Eliminar registros médicos propios',
      [Permission.SUBMIT_SELF_EVALUATION]: 'Enviar evaluaciones propias',
    };

    return descriptions[permissionName] || permissionName;
  }
}
