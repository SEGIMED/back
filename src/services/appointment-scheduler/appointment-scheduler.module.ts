import { Module } from '@nestjs/common';
import { AppointmentSchedulerService } from './appointment-scheduler.service';
import { AppointmentSchedulerController } from './appointment-scheduler.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuardAuthModule } from 'src/auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [AppointmentSchedulerController],
  providers: [AppointmentSchedulerService, PrismaService],
  exports: [AppointmentSchedulerService],
})
export class AppointmentSchedulerModule {}
