import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PatientStudiesService } from './patient-studies.service';
import { PatientStudiesController } from './patient-studies.controller';

@Module({
  controllers: [PatientStudiesController],
  providers: [PatientStudiesService, PrismaService],
})
export class PatientStudiesModule {}