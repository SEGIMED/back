import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/management/user/user.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { EmergencyContactModule } from '../emergency-contact/emergency-contact.module';
import { EmergencyContactService } from '../emergency-contact/emergency-contact.service';
import { PatientInsuranceModule } from '../patient-insurance/patient-insurance.module';
import { PatientInsuranceService } from '../patient-insurance/patient-insurance.service';

@Module({
  imports: [GuardAuthModule, EmergencyContactModule, PatientInsuranceModule],
  controllers: [PatientController],
  providers: [PatientService, PrismaService, UserService, EmergencyContactService, PatientInsuranceService],
})
export class PatientModule {}
