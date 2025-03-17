import { Module } from '@nestjs/common';
import { SelfEvaluationEventModule } from './self-evaluation-event/self-evaluation-event.module';

@Module({
  imports: [SelfEvaluationEventModule],
})
export class MobileFunctionsModule {}
