import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from './permissions/permissions.service';
import { RolesService } from './roles/roles.service';
import { PermissionCheckerService } from './permissions/permission-checker.service';
import { PermissionGuard } from './guards/permission.guard';
import { TenantAccessGuard } from './guards/tenant-access.guard';
import { TenantAdminGuard } from './guards/tenant-admin.guard';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { RolesController } from './controllers/roles.controller';
import { UserRoleManagerService } from './roles/user-role-manager.service';
import { PermissionUpdaterService } from './services/permission-updater.service';
import { PermissionUpdaterController } from './controllers/permission-updater.controller';

@Module({
  controllers: [RolesController, PermissionUpdaterController],
  providers: [
    PrismaService,
    PermissionsService,
    RolesService,
    PermissionCheckerService,
    PermissionGuard,
    TenantAccessGuard,
    TenantAdminGuard,
    SuperAdminGuard,
    UserRoleManagerService,
    PermissionUpdaterService,
  ],
  exports: [
    PermissionsService,
    RolesService,
    PermissionCheckerService,
    PermissionGuard,
    TenantAccessGuard,
    TenantAdminGuard,
    SuperAdminGuard,
    UserRoleManagerService,
    PermissionUpdaterService,
  ],
})
export class GuardAuthModule {}
