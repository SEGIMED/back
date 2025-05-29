import { Module } from '@nestjs/common';
import { MobileAppointmentsController } from './appointments.controller';
import { MobileAppointmentsService } from './appointments.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [PrismaModule, GuardAuthModule],
  controllers: [MobileAppointmentsController],
  providers: [MobileAppointmentsService],
  exports: [MobileAppointmentsService],
})
export class MobileAppointmentsModule {}
