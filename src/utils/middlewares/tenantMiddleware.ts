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
      if (req.originalUrl.includes('/auth')) {
        next();
        return;
      }

      if (
        req.originalUrl.includes('/chat') ||
        req.originalUrl.includes('/alarmas')
      ) {
        next();
        return;
      }

      const authorization = req.headers['authorization'];
      if (!authorization) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const token = authorization.replace('Bearer ', '');

      try {
        AuthHelper.verifyToken(token);
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      }
      const tenant_id = req.headers['x-tenant-id'] as string;
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

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
