import { Module } from '@nestjs/common';
import { MedicalEventsController } from './medical-events.controller';
import { MedicalEventsService } from './medical-events.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MedicalEventsController],
  providers: [MedicalEventsService, PrismaService],
  exports: [],
})
export class MedicalEventsModule {}
