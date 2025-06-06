import { Module } from '@nestjs/common';
import { PatientReminderSettingsService } from './patient-reminder-settings.service';
import { PrismaService } from '../../../../../prisma/prisma.service';

@Module({
  providers: [PatientReminderSettingsService, PrismaService],
  exports: [PatientReminderSettingsService],
})
export class PatientReminderSettingsModule {}
