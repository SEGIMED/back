import { Module } from '@nestjs/common';
import { MedicalEventsController } from './medical-events.controller';
import { MedicalEventsService } from './medical-events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { VitalSignsModule } from '../modules/vital-signs/vital-signs.module';
import { PhysicalExplorationModule } from '../modules/physical-exploration-data/physical-exploration/physical-exploration.module';
import { PhysicalExaminationModule } from '../modules/physical-examination-data/physical-examination/physical_examination.module';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service';
import { FileUploadRepository } from 'src/utils/file_upload/file_upload.repository';
import { CloudinaryConfig } from 'src/utils/cloudinary';

@Module({
  imports: [
    GuardAuthModule,
    VitalSignsModule,
    PhysicalExplorationModule,
    PhysicalExaminationModule,
  ],
  controllers: [MedicalEventsController],
  providers: [
    MedicalEventsService,
    PrismaService,
    FileUploadService,
    FileUploadRepository,
    CloudinaryConfig,
  ],
  exports: [MedicalEventsService],
})
export class MedicalEventsModule {}
