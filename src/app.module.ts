import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';

@Module({
  imports: [AppointmentsModule, MedicalEventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
