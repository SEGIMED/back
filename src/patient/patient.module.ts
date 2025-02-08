import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { SoftDeleteModule } from 'src/services/soft-delete/soft-delete.module';

@Module({
  imports: [SoftDeleteModule],
  controllers: [PatientController],
  providers: [PatientService, PrismaService, UserService],
})
export class PatientModule {}
