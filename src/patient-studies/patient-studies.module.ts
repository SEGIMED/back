import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PatientStudiesService } from './patient-studies.service';
import { PatientStudiesController } from './patient-studies.controller';
import { FileUploadService } from '../file_upload/file_upload.service';
import { FileUploadRepository } from 'src/file_upload/file_upload.repository';

@Module({
  controllers: [PatientStudiesController],
  providers: [PatientStudiesService, PrismaService, FileUploadService,FileUploadRepository],
})
export class PatientStudiesModule {}