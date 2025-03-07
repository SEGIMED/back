import { Module } from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { MedicalOrderController } from './medical_order.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MedicalOrderController],
  providers: [MedicalOrderService, PrismaService],
})
export class MedicalOrderModule {}
