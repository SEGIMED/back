import { Controller, Post, UseGuards } from '@nestjs/common';
import { PermissionUpdaterService } from '../services/permission-updater.service';
import { SuperAdminGuard } from '../guards/superadmin.guard';

@Controller('permission-updater')
export class PermissionUpdaterController {
  constructor(
    private readonly permissionUpdaterService: PermissionUpdaterService,
  ) {}

  /**
   * Endpoint para actualizar permisos por defecto para médicos y pacientes
   * Solo accesible por superadministradores
   */
  @Post('update-default-permissions')
  @UseGuards(SuperAdminGuard)
  async updateDefaultPermissions() {
    return this.permissionUpdaterService.updateDefaultPermissions();
  }
}
