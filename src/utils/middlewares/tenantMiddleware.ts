import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from '../auth.helper';
import { RequestContextService } from '../../auth/services/request-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContext: RequestContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Permitir acceso a la documentación de Swagger sin autenticación
      const isSwaggerRequest =
        req.path === '/api' ||
        req.path.startsWith('/api/') ||
        req.originalUrl === '/api' ||
        req.originalUrl.startsWith('/api/');

      // Si es una petición de Swagger o relacionada con la documentación, permitir sin autenticación
      if (isSwaggerRequest || req.headers['referer']?.includes('/api')) {
        return next();
      }

      const authorization = req.headers['authorization'];
      if (!authorization) {
        // Log detallado para debugging
        console.error('❌ Authorization header missing:', {
          path: req.path,
          originalUrl: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent'],
          referer: req.headers['referer'],
          host: req.headers['host'],
          timestamp: new Date().toISOString(),
          headers: Object.keys(req.headers),
        });
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

      // Establecer información del usuario en el contexto
      this.requestContext.setUser({
        id: payload.userId || payload.id,
        role: payload.role,
        tenant_id: payload.tenant_id,
        tenants: payload.tenants,
      });

      // Check if this is a patient with multiple tenants
      if (
        payload.role === 'patient' &&
        payload.tenants &&
        Array.isArray(payload.tenants) &&
        payload.tenants.length > 0
      ) {
        // Store tenants info for patients
        this.requestContext.setUserTenants(payload.tenants);

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
              this.requestContext.setTenantId(requestTenantId);
              this.requestContext.setTenant({
                id: tenant.id,
                type: tenant.type,
                db_name: tenant.db_name,
              });
              // Mantener compatibilidad con req para otros middlewares
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
          this.requestContext.setTenantId(firstTenantId);
          this.requestContext.setTenant({
            id: tenant.id,
            type: tenant.type,
            db_name: tenant.db_name,
          });
          // Mantener compatibilidad con req para otros middlewares
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

        // Establecer en el contexto CLS
        this.requestContext.setTenantId(tenant_id);
        this.requestContext.setTenant({
          id: tenant.id,
          type: tenant.type,
          db_name: tenant.db_name,
        });

        // Mantener compatibilidad con req para otros middlewares
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
