import { Module } from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { VitalSignsController } from './vital-signs.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { GuardAuthModule } from '../../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [VitalSignsController],
  providers: [VitalSignsService, PrismaService],
  exports: [VitalSignsService],
})
export class VitalSignsModule {}
