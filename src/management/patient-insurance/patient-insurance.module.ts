import { Module } from '@nestjs/common';
import { PatientInsuranceController } from './patient-insurance.controller';
import { PatientInsuranceService } from './patient-insurance.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PatientInsuranceController],
  providers: [PatientInsuranceService, PrismaService],
  exports: [PatientInsuranceService],
})
export class PatientInsuranceModule {}
