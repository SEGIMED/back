import { Module } from '@nestjs/common';
import { PhysicalExaminationService } from './physical-examination.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PhysicalExaminationService, PrismaService],
  exports: [PhysicalExaminationService],
})
export class PhysicalExaminationModule {}
