import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionModule } from './suscription/subscription.module';
import { SubscriptionService } from './suscription/subscription.service';

@Module({
  imports: [AppointmentsModule, MedicalEventsModule, SubscriptionModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaModule, SubscriptionService],
})
export class AppModule {}