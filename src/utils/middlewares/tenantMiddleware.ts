import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from '../auth.helper';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Permitir acceso a la documentación de Swagger sin autenticación
      const isSwaggerRequest =
        req.path === '/api' ||
        req.path.startsWith('/api/') ||
        req.originalUrl === '/api' ||
        req.originalUrl.startsWith('/api/') ||
        req.headers['referer']?.includes('/api');

      // Si es una petición de Swagger o relacionada con la documentación, permitir sin autenticación
      if (isSwaggerRequest) {
        return next();
      }

      // Verificar si la URL es para crear un superadmin, ya que esa ruta está excluida
      if (req.path === '/auth/create-superadmin' && req.method === 'POST') {
        return next();
      }

      const authorization = req.headers['authorization'];
      if (!authorization) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const token = authorization.replace('Bearer ', '');
      let payload: any;

      try {
        payload = AuthHelper.verifyToken(token);
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      }

      // Check if this is a patient with multiple tenants
      if (
        payload.role === 'patient' &&
        payload.tenants &&
        Array.isArray(payload.tenants) &&
        payload.tenants.length > 0
      ) {
        // Store tenants info for patients
        req['userTenants'] = payload.tenants;

        // If there's a tenant_id in the header/request and it's in the list of
        // patient's tenants, use that one
        const requestTenantId =
          (req.headers['x-tenant-id'] as string) ||
          (req.query.tenantId as string) ||
          (req.body && req.body.tenantId);

        if (requestTenantId) {
          const matchingTenant = payload.tenants.find(
            (t) => t.id === requestTenantId,
          );
          if (matchingTenant) {
            // If the requested tenant is in the patient's tenants, set it as the current tenant
            const tenant = await this.prisma.tenant.findUnique({
              where: { id: requestTenantId },
            });
            if (tenant) {
              global.tenant_id = requestTenantId;
              req['tenant_id'] = requestTenantId;
              req['tenant'] = tenant;
              next();
              return;
            }
          }
        }

        // If no specific tenant is requested but the patient has tenants, use the first one
        const firstTenantId = payload.tenants[0].id;
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: firstTenantId },
        });
        if (tenant) {
          global.tenant_id = firstTenantId;
          req['tenant_id'] = firstTenantId;
          req['tenant'] = tenant;
          next();
          return;
        }
      } else {
        // Regular handling for non-patient users
        const tenant_id = payload?.tenant_id;
        if (!tenant_id) {
          throw new UnauthorizedException('Tenant ID not found in token');
        }

        const tenant = await this.prisma.tenant.findUnique({
          where: {
            id: tenant_id,
          },
        });
        if (!tenant) {
          throw new UnauthorizedException('Invalid tenant');
        }

        // Guardar en el contexto global
        global.tenant_id = tenant_id;

        req['tenant_id'] = tenant_id;
        req['tenant'] = tenant;
      }

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
