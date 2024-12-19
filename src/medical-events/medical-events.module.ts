import { Module } from '@nestjs/common';
import { MedicalEventsController } from './medical-events.controller';
import { MedicalEventsService } from './medical-events.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [MedicalEventsController],
  providers: [MedicalEventsService, PrismaService],
})
export class MedicalEventsModule {}
