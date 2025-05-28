import { Controller, Post, UseGuards } from '@nestjs/common';
import { PermissionUpdaterService } from '../services/permission-updater.service';
import { SuperAdminGuard } from '../guards/superadmin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiTags('Permission Updater')
@ApiSecurity('access-token')
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
  @ApiOperation({
    summary: 'Actualiza los permisos predeterminados para médicos y pacientes',
    description:
      'Actualiza la configuración de permisos predeterminados en el sistema. Solo accesible para superadministradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos predeterminados actualizados exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de superadministrador',
  })
  async updateDefaultPermissions() {
    return this.permissionUpdaterService.updateDefaultPermissions();
  }
}
