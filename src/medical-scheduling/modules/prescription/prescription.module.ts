import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FrequencyParsingService } from './services/frequency-parsing.service';

@Module({
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrismaService, FrequencyParsingService],
  exports: [PrescriptionService, FrequencyParsingService],
})
export class PrescriptionModule {}
