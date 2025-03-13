import { Module } from '@nestjs/common';
import { OrderTypeService } from './order-type.service';
import { OrderTypeController } from './order-type.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [OrderTypeController],
  providers: [OrderTypeService, PrismaService],
})
export class OrderTypeModule {}
