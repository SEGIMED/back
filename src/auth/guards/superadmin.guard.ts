import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    // Si no hay usuario autenticado, denegar acceso
    if (!userId) {
      throw new ForbiddenException('No autorizado');
    }
    console.log('userId', userId);
    // Verificar si el usuario es superadmin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { is_superadmin: true },
    });

    if (!user || !user.is_superadmin) {
      throw new ForbiddenException(
        'Se requieren permisos de superadministrador',
      );
    }

    return true;
  }
}
