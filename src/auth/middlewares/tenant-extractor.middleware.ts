import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantExtractorMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Obtener el tenant ID de los headers, query params o body
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      (req.query.tenantId as string) ||
      (req.body && req.body.tenantId);

    if (tenantId) {
      try {
        // Verificar si el tenant existe
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, type: true, db_name: true },
        });

        if (tenant) {
          // Agregar el tenant al request para que esté disponible en los controladores
          req['tenant'] = tenant;
        }
      } catch (error) {
        // Si hay un error, simplemente continuar sin tenant
        console.error('Error al obtener tenant:', error);
      }
    }

    next();
  }
}
