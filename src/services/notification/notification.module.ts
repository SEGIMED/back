import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailModule } from '../email/email.module';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [EmailModule, TwilioModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
