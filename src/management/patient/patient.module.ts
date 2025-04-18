import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/management/user/user.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [PatientController],
  providers: [PatientService, PrismaService, UserService],
})
export class PatientModule {}
