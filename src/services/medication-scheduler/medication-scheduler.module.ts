import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MedicationSchedulerService } from './medication-scheduler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { EmailService } from '../email/email.service';
import { TwilioService } from '../twilio/twilio.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    MedicationSchedulerService,
    PrismaService,
    NotificationService,
    EmailService,
    TwilioService,
  ],
  exports: [MedicationSchedulerService],
})
export class MedicationSchedulerModule {}
