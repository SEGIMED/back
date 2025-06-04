import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PatientStudiesService } from './patient-studies.service';
import { PatientStudiesController } from './patient-studies.controller';
import { FileUploadService } from '../../../utils/file_upload/file_upload.service';
import { FileUploadRepository } from 'src/utils/file_upload/file_upload.repository';
import { CatStudyTypeService } from '../../../catalogs/cat-study-type/cat-study-type.service';
import { GuardAuthModule } from '../../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [PatientStudiesController],
  providers: [
    PatientStudiesService,
    CatStudyTypeService,
    PrismaService,
    FileUploadService,
    FileUploadRepository,
  ],
})
export class PatientStudiesModule {}
