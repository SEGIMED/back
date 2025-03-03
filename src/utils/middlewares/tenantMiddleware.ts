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
    const authorization = req.headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authorization.replace('Bearer ', '');
    const payload: any = AuthHelper.verifyToken(token);

    const tenant_id = payload?.tenant_id;
    if (!tenant_id) {
      throw new UnauthorizedException('Tenant ID not found in token');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenant_id },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    req['tenant_id'] = tenant_id;
    next();
  }
}
