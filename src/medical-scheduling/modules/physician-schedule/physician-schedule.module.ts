import { Module } from '@nestjs/common';
import { PhysicianScheduleService } from './physician-schedule.service';
import { PhysicianScheduleController } from './physician-schedule.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { PermissionCheckerService } from 'src/auth/permissions/permission-checker.service';

@Module({
  controllers: [PhysicianScheduleController],
  providers: [
    PhysicianScheduleService,
    PrismaService,
    PermissionCheckerService,
  ],
  exports: [PhysicianScheduleService],
})
export class PhysicianScheduleModule {}
