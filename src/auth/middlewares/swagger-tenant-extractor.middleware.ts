import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthHelper } from '../../utils/auth.helper';

@Injectable()
export class SwaggerTenantExtractorMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo procesar rutas de Swagger si hay un token Bearer
    const isSwaggerRequest =
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.originalUrl === '/api' ||
      req.originalUrl.startsWith('/api/');

    if (!isSwaggerRequest) {
      return next();
    }

    // Obtener el token de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      // Verificar y decodificar el token
      const payload = AuthHelper.verifyToken(token) as any;
      if (!payload) {
        return next();
      }

      // Extraer información del usuario del token
      const userId = payload.sub;
      if (!userId) {
        return next();
      }

      // Obtener información completa del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          tenant_id: true,
          is_superadmin: true,
        },
      });

      if (!user) {
        return next();
      }

      // Agregar usuario al request
      req['user'] = user;

      // Manejar extracción de tenant según el tipo de usuario
      if (user.role === 'patient') {
        // Para pacientes, obtener todos los tenants disponibles
        const patientTenants = await this.prisma.patient_tenant.findMany({
          where: { patient_id: userId },
          include: {
            tenant: {
              select: { id: true, type: true, db_name: true },
            },
          },
        });

        const userTenants = patientTenants.map((pt) => pt.tenant);
        req['userTenants'] = userTenants;

        // Obtener tenant específico del header o query si está disponible
        const requestedTenantId =
          (req.headers['x-tenant-id'] as string) ||
          (req.headers['tenant-id'] as string) ||
          (req.query.tenantId as string);

        if (requestedTenantId) {
          // Verificar que el paciente tenga acceso a este tenant
          const matchingTenant = userTenants.find(
            (t) => t.id === requestedTenantId,
          );
          if (matchingTenant) {
            req['tenant'] = matchingTenant;
            global.tenant_id = matchingTenant.id;
          }
        } else if (userTenants.length > 0) {
          // Si no se especifica tenant pero el paciente tiene tenants, usar el primero
          const firstTenant = userTenants[0];
          req['tenant'] = firstTenant;
          global.tenant_id = firstTenant.id;
        }
      } else {
        // Para usuarios regulares, usar el tenant_id del token o del usuario
        const tenantId = payload.tenant_id || user.tenant_id;

        if (tenantId) {
          const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, type: true, db_name: true },
          });

          if (tenant) {
            req['tenant'] = tenant;
            global.tenant_id = tenant.id;
          }
        }
      }
    } catch (error) {
      // Si hay error en el procesamiento del token, continuar sin tenant
      console.error('Error al procesar token en Swagger:', error);
    }

    next();
  }
}
