import { Module } from '@nestjs/common';
import { SelfEvaluationEventModule } from './self-evaluation-event/self-evaluation-event.module';
import { MoodModule } from './mood/mood.module';
import { MobileAppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [SelfEvaluationEventModule, MoodModule, MobileAppointmentsModule],
})
export class MobileFunctionsModule {}
