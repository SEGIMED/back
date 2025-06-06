import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PatientReminderSettingsModule } from './modules/patient-reminder-settings/patient-reminder-settings.module';
import { GuardAuthModule } from '../../../auth/guard-auth.module';

@Module({
  imports: [PatientReminderSettingsModule, GuardAuthModule],
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService],
  exports: [SettingsService, PatientReminderSettingsModule],
})
export class SettingsModule {}
