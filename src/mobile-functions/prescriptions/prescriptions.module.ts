import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrismaService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
