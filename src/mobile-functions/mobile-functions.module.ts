import { Module } from '@nestjs/common';
import { SelfEvaluationEventModule } from './self-evaluation-event/self-evaluation-event.module';
import { MoodModule } from './mood/mood.module';

@Module({
  imports: [SelfEvaluationEventModule, MoodModule],
})
export class MobileFunctionsModule {}
