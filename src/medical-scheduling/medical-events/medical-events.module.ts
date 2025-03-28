import { Module } from '@nestjs/common';
import { MedicalEventsController } from './medical-events.controller';
import { MedicalEventsService } from './medical-events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { VitalSignsModule } from '../modules/vital-signs/vital-signs.module';
import { PhysicalExplorationModule } from '../modules/physical-exploration-data/physical-exploration/physical-exploration.module';
import { PhysicalExaminationModule } from '../modules/physical-examination-data/physical-examination/physical_examination.module';

@Module({
  imports: [
    GuardAuthModule,
    VitalSignsModule,
    PhysicalExplorationModule,
    PhysicalExaminationModule,
  ],
  controllers: [MedicalEventsController],
  providers: [MedicalEventsService, PrismaService],
  exports: [MedicalEventsService],
})
export class MedicalEventsModule {}
