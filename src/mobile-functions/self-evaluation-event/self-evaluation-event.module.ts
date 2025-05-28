import { Module } from '@nestjs/common';
import { SelfEvaluationEventService } from './self-evaluation-event.service';
import { SelfEvaluationEventController } from './self-evaluation-event.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { VitalSignsModule } from '../../medical-scheduling/modules/vital-signs/vital-signs.module';

@Module({
  imports: [GuardAuthModule, VitalSignsModule],
  controllers: [SelfEvaluationEventController],
  providers: [SelfEvaluationEventService, PrismaService],
})
export class SelfEvaluationEventModule {}
