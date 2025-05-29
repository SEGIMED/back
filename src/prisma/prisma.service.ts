import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantPrismaMiddleware } from 'src/utils/middlewares/tenantPrismaMiddleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Middleware refactorizado con soporte multi-tenant
    this.$use(tenantPrismaMiddleware());

    console.log('Prisma middleware registered with multi-tenant support');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
