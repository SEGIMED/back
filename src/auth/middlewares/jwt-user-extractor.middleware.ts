import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthHelper } from '../../utils/auth.helper';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtUserExtractorMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Permitir acceso a la documentación de Swagger sin procesar
      const isSwaggerRequest =
        req.path === '/api' ||
        req.path.startsWith('/api/') ||
        req.originalUrl === '/api' ||
        req.originalUrl.startsWith('/api/');

      if (isSwaggerRequest) {
        return next();
      }

      const authorization = req.headers['authorization'];
      if (!authorization) {
        next();
        return;
      }

      const token = authorization.replace('Bearer ', '');
      try {
        const payload = AuthHelper.verifyToken(token);
        if (typeof payload === 'string') {
          next();
          return;
        }

        // Extract user ID from payload
        const userId = payload.id;
        if (!userId) {
          next();
          return;
        }

        // Get user information from database
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            last_name: true,
            role: true,
            tenant_id: true,
          },
        });

        if (user) {
          // Add the user to the request
          req['user'] = user;

          // Store tenants info for patients
          if (user.role === 'patient') {
            // Check if tenants are provided in JWT
            if (payload.tenants && Array.isArray(payload.tenants)) {
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
                  global.tenant_id = requestTenantId;
                }
              }
            }
          } else if (user.tenant_id) {
            // For non-patient users, just set the tenant_id as before
            global.tenant_id = user.tenant_id;
          }
        }
      } catch (error) {
        // If there's an error verifying the token, simply continue
        console.error('Error al verificar token JWT:', error);
      }

      next();
    } catch (error) {
      console.error('Error en middleware JWT:', error);
      next();
    }
  }
}
