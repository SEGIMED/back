import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { Permission } from '../permissions/permission.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { TenantAccessGuard } from '../guards/tenant-access.guard';
import { TenantAdminGuard } from '../guards/tenant-admin.guard';
import { SuperAdminGuard } from '../guards/superadmin.guard';

interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  tenantId?: string;
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

interface AssignRoleDto {
  userId: string;
  roleId: string;
}

@Controller('roles')
@UseGuards(PermissionGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('permissions')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get()
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async getRoles(@Query('tenantId') tenantId?: string) {
    return this.rolesService.getRoles(tenantId);
  }

  @Get(':id')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async getRoleById(@Param('id') id: string) {
    try {
      return await this.rolesService.getRoleById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener el rol: ${error.message}`,
      );
    }
  }

  @Post()
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    try {
      return await this.rolesService.createRole(createRoleDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el rol: ${error.message}`);
    }
  }

  @Put(':id')
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      return await this.rolesService.updateRole(id, updateRoleDto);
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

  @Delete(':id')
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async deleteRole(@Param('id') id: string) {
    try {
      return await this.rolesService.deleteRole(id);
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

  @Post('assign')
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    try {
      return await this.rolesService.assignRoleToUser(
        assignRoleDto.userId,
        assignRoleDto.roleId,
      );
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

  @Delete('assign')
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async removeRoleFromUser(@Body() assignRoleDto: AssignRoleDto) {
    try {
      return await this.rolesService.removeRoleFromUser(
        assignRoleDto.userId,
        assignRoleDto.roleId,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar rol del usuario: ${error.message}`,
      );
    }
  }

  @Get('user/:userId')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  async getUserRoles(@Param('userId') userId: string) {
    try {
      return await this.rolesService.getUserRoles(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener roles del usuario: ${error.message}`,
      );
    }
  }

  @Post('seed')
  @UseGuards(SuperAdminGuard)
  async seedRolesAndPermissions() {
    try {
      // Primero crear los permisos
      await this.permissionsService.seedPermissions();

      // Luego crear los roles por defecto
      return await this.rolesService.seedDefaultRoles();
    } catch (error) {
      throw new BadRequestException(
        `Error al crear roles y permisos por defecto: ${error.message}`,
      );
    }
  }
}
