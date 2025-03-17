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
    const userId = request.user?.id;
    const tenantId = request.tenant?.id;

    // Si no hay usuario autenticado o tenant, denegar acceso
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!tenantId) {
      throw new ForbiddenException('No se pudo determinar el tenant');
    }

    // Verificar si el usuario tiene acceso al tenant
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
