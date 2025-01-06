import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MedicalEventsModule } from '../medical-events/medical-events.module';

@Module({
  imports: [MedicalEventsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService],
})
export class AppointmentsModule {}
