import { Module } from '@nestjs/common';
import { CatVitalSignsService } from './cat-vital-signs.service';
import { CatVitalSignsController } from './cat-vital-signs.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from 'src/auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [CatVitalSignsController],
  providers: [CatVitalSignsService, PrismaService],
})
export class CatVitalSignsModule {}
