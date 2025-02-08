import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenant_id = req.headers['x-tenant-id'];
    if (!tenant_id) {
      return res.status(401).json({ message: 'x-tenant-id header is missing' });
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: {
        id: tenant_id as string,
      },
    });

    if (!tenant) {
      return res.status(401).json({ message: 'Tenant not found' });
    }

    const user_id = req['user']?.id;
    if (!user_id) {
      return res.status(401).json({ message: 'User not found' });
    }

    const userTenant = await this.prisma.user_tenant.findFirst({
      where: {
        tenant_id: tenant_id as string,
        user_id,
      },
    });

    if (!userTenant) {
      return res
        .status(401)
        .json({ message: 'User is not authorized for this tenant' });
    }
    req['tenant_id'] = tenant.id;
    next();
  }
}
