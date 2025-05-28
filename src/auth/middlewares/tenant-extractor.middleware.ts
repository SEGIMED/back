import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantExtractorMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Permitir acceso a la documentación de Swagger sin procesar
    const isSwaggerRequest =
      req.path === '/api' ||
      req.path.startsWith('/api/') ||
      req.originalUrl === '/api' ||
      req.originalUrl.startsWith('/api/');

    if (isSwaggerRequest) {
      return next();
    }

    // Get the tenant ID from headers, query params or body
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      (req.query.tenantId as string) ||
      (req.body && req.body.tenantId);

    // Check if this is a patient with multiple tenants
    const user = req['user'];
    const userTenants = req['userTenants'];

    if (
      user &&
      user.role === 'patient' &&
      userTenants &&
      userTenants.length > 0
    ) {
      // If a specific tenant is requested and it's in the patient's tenants, use that one
      if (tenantId) {
        const matchingTenant = userTenants.find((t) => t.id === tenantId);
        if (matchingTenant) {
          // Get the full tenant info
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
      // If no specific tenant is requested but the patient has tenants, use the first one
      else if (userTenants.length > 0) {
        const firstTenantId = userTenants[0].id;
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: firstTenantId },
          select: { id: true, type: true, db_name: true },
        });

        if (tenant) {
          req['tenant'] = tenant;
          global.tenant_id = tenant.id;
        }
      }
    }
    // Regular tenant handling (non-patient users or patients with a single tenant)
    else if (tenantId) {
      try {
        // Check if the tenant exists
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, type: true, db_name: true },
        });

        if (tenant) {
          // Add the tenant to the request so it's available in controllers
          req['tenant'] = tenant;
          global.tenant_id = tenant.id;
        }
      } catch (error) {
        // If there's an error, just continue without a tenant
        console.error('Error al obtener tenant:', error);
      }
    }

    next();
  }
}
