import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCheckerService } from '../permissions/permission-checker.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionChecker: PermissionCheckerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se requiere permiso específico, permitir acceso
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const tenantId = request.tenant?.id;

    // Si no hay usuario autenticado, denegar acceso
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!tenantId) {
      throw new ForbiddenException('No se pudo determinar el tenant');
    }

    // Verificar si el usuario tiene el permiso requerido
    const hasPermission = await this.permissionChecker.hasPermission(
      userId,
      requiredPermission,
      tenantId,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`No tiene permiso: ${requiredPermission}`);
    }

    return true;
  }
}
