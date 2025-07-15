import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/management/user/user.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';
import { EmergencyContactModule } from '../emergency-contact/emergency-contact.module';
import { EmergencyContactService } from '../emergency-contact/emergency-contact.service';

@Module({
  imports: [GuardAuthModule, EmergencyContactModule],
  controllers: [PatientController],
  providers: [PatientService, PrismaService, UserService, EmergencyContactService],
})
export class PatientModule {}
