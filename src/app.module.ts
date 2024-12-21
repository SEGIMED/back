import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AppointmentsModule, MedicalEventsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
