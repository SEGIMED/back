import { Module } from '@nestjs/common';
import { PhysicalExplorationAreaController } from './physical-exploration-area.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhysicalExplorationAreaService } from './physical-exploration-area.service';

@Module({
  controllers: [PhysicalExplorationAreaController],
  providers: [PrismaService, PhysicalExplorationAreaService],
})
export class PhysicalExplorationAreaModule {}
