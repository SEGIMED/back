import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthHelper } from '../../utils/auth.helper';

@Injectable()
export class SwaggerTenantExtractorMiddleware implements NestMiddleware {
  // NOTA: A pesar del nombre "Swagger", este middleware ahora funciona para todas las rutas autenticadas
  // Extrae automáticamente el tenant del JWT eliminando la necesidad de headers manuales
  constructor(private prisma: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
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
      const userId = payload.sub || payload.id; // Soportar tanto 'sub' como 'id'
      console.log('🔍 DEBUG: Payload del token:', {
        sub: payload.sub,
        id: payload.id,
        userId,
        role: payload.role,
        tenant_id: payload.tenant_id,
      });

      if (!userId) {
        console.log('❌ DEBUG: No se encontró userId en el token');
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
        console.log('❌ DEBUG: Usuario no encontrado en BD con ID:', userId);
        return next();
      }

      console.log('✅ DEBUG: Usuario encontrado en BD:', {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
        is_superadmin: user.is_superadmin,
      });

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
        // Para usuarios regulares (admin/superadmin), usar el tenant_id del token o del usuario
        console.log('🔍 DEBUG: Usuario no-paciente detectado:', {
          userId: user.id,
          role: user.role,
          is_superadmin: user.is_superadmin,
          user_tenant_id: user.tenant_id,
          payload_tenant_id: payload.tenant_id,
        });

        // Si es superadmin y no hay tenant_id en el token, usar el tenant por defecto o cualquier tenant
        if (user.is_superadmin && !payload.tenant_id && !user.tenant_id) {
          console.log(
            '⚡ DEBUG: Superadmin sin tenant específico, buscando cualquier tenant...',
          );

          // Para superadmins, obtener cualquier tenant disponible como fallback
          const anyTenant = await this.prisma.tenant.findFirst({
            select: { id: true, type: true, db_name: true },
          });

          if (anyTenant) {
            req['tenant'] = anyTenant;
            global.tenant_id = anyTenant.id;
            console.log(
              '✅ DEBUG: Tenant por defecto asignado a superadmin:',
              anyTenant,
            );
          } else {
            console.log('❌ DEBUG: No hay tenants disponibles en el sistema');
          }
        } else {
          // Lógica normal para usuarios con tenant específico
          const tenantId = payload.tenant_id || user.tenant_id;

          if (tenantId) {
            const tenant = await this.prisma.tenant.findUnique({
              where: { id: tenantId },
              select: { id: true, type: true, db_name: true },
            });

            if (tenant) {
              req['tenant'] = tenant;
              global.tenant_id = tenant.id;
              console.log('✅ DEBUG: Tenant asignado exitosamente:', tenant);
            } else {
              console.log('❌ DEBUG: Tenant no encontrado en BD:', tenantId);
            }
          } else {
            console.log(
              '❌ DEBUG: No se encontró tenant_id en token ni usuario',
            );
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
