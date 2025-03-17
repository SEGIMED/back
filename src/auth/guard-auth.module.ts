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

@Module({
  controllers: [RolesController],
  providers: [
    PrismaService,
    PermissionsService,
    RolesService,
    PermissionCheckerService,
    PermissionGuard,
    TenantAccessGuard,
    TenantAdminGuard,
    SuperAdminGuard,
  ],
  exports: [
    PermissionsService,
    RolesService,
    PermissionCheckerService,
    PermissionGuard,
    TenantAccessGuard,
    TenantAdminGuard,
    SuperAdminGuard,
  ],
})
export class GuardAuthModule {}
