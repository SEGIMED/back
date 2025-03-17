import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionCheckerService } from '../permissions/permission-checker.service';

@Injectable()
export class TenantAdminGuard implements CanActivate {
  constructor(private permissionChecker: PermissionCheckerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const tenantId = request.tenant?.id;

    // Si no hay usuario autenticado o tenant, denegar acceso
    if (!userId || !tenantId) {
      throw new ForbiddenException('No autorizado');
    }

    // Verificar si el usuario es admin del tenant
    const isAdmin = await this.permissionChecker.isAdminOfTenant(
      userId,
      tenantId,
    );

    if (!isAdmin) {
      throw new ForbiddenException('Se requieren permisos de administrador');
    }

    return true;
  }
}
