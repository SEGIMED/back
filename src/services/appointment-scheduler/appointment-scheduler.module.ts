import { Module } from '@nestjs/common';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { AppointmentSchedulerController } from './appointment-scheduler.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AppointmentSchedulerController],
  providers: [AppointmentSchedulerService, PrismaService],
  exports: [AppointmentSchedulerService],
})
export class AppointmentSchedulerModule {}
