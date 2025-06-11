import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantPrismaMiddleware } from 'src/utils/middlewares/tenantPrismaMiddleware';
import { loggingPrismaMiddleware } from 'src/utils/middlewares/loggingPrismaMiddleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Configurar event listeners para los logs usando any para evitar problemas de tipos
    (this as any).$on('query', (e: any) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Params: ${e.params}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });

    (this as any).$on('info', (e: any) => {
      this.logger.log(e.message);
    });

    (this as any).$on('warn', (e: any) => {
      this.logger.warn(e.message);
    });

    (this as any).$on('error', (e: any) => {
      this.logger.error(e.message);
    });

    // Middleware de logging detallado (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      this.$use(loggingPrismaMiddleware());
      this.logger.log(
        'Prisma detailed logging middleware enabled (development only)',
      );
    }

    // Middleware refactorizado con soporte multi-tenant
    this.$use(tenantPrismaMiddleware());

    this.logger.log('Prisma connected with logging enabled');
    this.logger.log('Prisma middleware registered with multi-tenant support');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
