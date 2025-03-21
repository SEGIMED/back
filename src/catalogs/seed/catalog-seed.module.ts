import { Module } from '@nestjs/common';
import { CatalogSeedService } from './catalog-seed.service';
import { CatalogSeedController } from './catalog-seed.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [CatalogSeedController],
  providers: [CatalogSeedService, PrismaService],
  exports: [CatalogSeedService],
})
export class CatalogSeedModule {}
