import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PermissionCheckerService } from '../permissions/permission-checker.service';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private permissionChecker: PermissionCheckerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.id;
    const tenantId = request.tenant?.id;
    const userTenants = request.userTenants;

    // If there's no authenticated user, deny access
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Handle patients with multiple tenants differently
    if (user?.role === 'patient' && userTenants && userTenants.length > 0) {
      // If a tenant was requested and it's in the patient's list, allow access
      if (tenantId) {
        const hasTenant = userTenants.some((t) => t.id === tenantId);
        if (hasTenant) {
          return true;
        }

        throw new ForbiddenException('No tiene acceso a esta organización');
      }

      // If no tenant was specified but the patient has tenants, allow access
      if (userTenants.length > 0) {
        return true;
      }
    }

    // Regular tenant access check for non-patient users
    if (!tenantId) {
      throw new ForbiddenException('No se pudo determinar el tenant');
    }

    // Check if the user has access to the tenant
    const hasAccess = await this.permissionChecker.hasAccessToTenant(
      userId,
      tenantId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('No tiene acceso a esta organización');
    }

    return true;
  }
}
