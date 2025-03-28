import { Module } from '@nestjs/common';
import { PhysicalExplorationController } from './physical-exploration.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhysicalExplorationService } from './physical-exploration.service';

@Module({
  controllers: [PhysicalExplorationController],
  providers: [PrismaService, PhysicalExplorationService],
  exports: [PhysicalExplorationService],
})
export class PhysicalExplorationModule {}
