import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { NotificationService } from '../../services/notification/notification.service';
import { EmailService } from '../../services/email/email.service';

@Module({
  imports: [GuardAuthModule],
  controllers: [PrescriptionsController],
  providers: [
    PrescriptionsService,
    PrismaService,
    NotificationService,
    EmailService,
  ],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
