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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiOptionalTenantHeader } from '../decorators/tenant-header.decorator';

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

@ApiTags('Roles')
@ApiSecurity('access-token')
@Controller('roles')
@UseGuards(PermissionGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}
  @Delete('assign')
  @UseGuards(TenantAdminGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  @ApiOperation({ summary: 'Elimina un rol de un usuario' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenece el usuario',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del usuario',
        },
        roleId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del rol a eliminar',
        },
      },
      required: ['userId', 'roleId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol eliminado exitosamente del usuario',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error en la operación',
  })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
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
  @Get('permissions')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  @ApiOperation({
    summary: 'Obtiene todos los permisos disponibles en el sistema',
  })
  @ApiOptionalTenantHeader()
  @ApiResponse({
    status: 200,
    description: 'Lista de permisos recuperada exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para ver permisos',
  })
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }
  @Get()
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  @ApiOperation({ summary: 'Obtiene todos los roles disponibles' })
  @ApiOptionalTenantHeader()
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'ID del tenant para filtrar roles específicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles recuperada exitosamente',
  })
  @ApiResponse({ status: 403, description: 'No tiene permisos para ver roles' })
  async getRoles(@Query('tenantId') tenantId?: string) {
    return this.rolesService.getRoles(tenantId);
  }
  @Get(':id')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  @ApiOperation({ summary: 'Obtiene un rol específico por su ID' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant para verificar acceso',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del rol a consultar' })
  @ApiResponse({ status: 200, description: 'Rol recuperado exitosamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para ver roles' })
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
  @ApiOperation({ summary: 'Crea un nuevo rol' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenecerá el rol',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del rol' },
        description: { type: 'string', description: 'Descripción del rol' },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de permisos asignados al rol',
        },
        tenantId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del tenant (opcional)',
        },
      },
      required: ['name', 'permissions'],
    },
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para crear roles',
  })
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
  @ApiOperation({ summary: 'Actualiza un rol existente' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenece el rol',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del rol a actualizar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del rol' },
        description: { type: 'string', description: 'Descripción del rol' },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de permisos asignados al rol',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para actualizar roles',
  })
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
  @ApiOperation({ summary: 'Elimina un rol' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenece el rol',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del rol a eliminar' })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para eliminar roles',
  })
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
  @ApiOperation({ summary: 'Asigna un rol a un usuario' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenece el usuario',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del usuario',
        },
        roleId: {
          type: 'string',
          format: 'uuid',
          description: 'ID del rol a asignar',
        },
      },
      required: ['userId', 'roleId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rol asignado exitosamente al usuario',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para asignar roles',
  })
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
  @Get('user/:userId')
  @UseGuards(TenantAccessGuard)
  @RequirePermission(Permission.CONFIGURE_USER_PERMISSIONS)
  @ApiOperation({ summary: 'Obtiene todos los roles asignados a un usuario' })
  @ApiHeader({
    name: 'tenant-id',
    description: 'ID del tenant al que pertenece el usuario',
    required: true,
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario recuperados exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para ver roles de usuarios',
  })
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
  @ApiOperation({
    summary: 'Inicializa roles y permisos predeterminados',
    description:
      'Crea los roles y permisos iniciales del sistema. Solo accesible para superadministradores.',
  })
  @ApiResponse({
    status: 201,
    description: 'Roles y permisos inicializados exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al crear roles y permisos' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de superadministrador',
  })
  async seedRolesAndPermissions() {
    try {
      await this.permissionsService.seedPermissions();

      return await this.rolesService.seedDefaultRoles();
    } catch (error) {
      throw new BadRequestException(
        `Error al crear roles y permisos por defecto: ${error.message}`,
      );
    }
  }
}
