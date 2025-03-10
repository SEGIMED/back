import { Module } from '@nestjs/common';
import { PresModHistoryService } from './pres_mod_history.service';
import { PresModHistoryController } from './pres_mod_history.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PresModHistoryController],
  providers: [PresModHistoryService, PrismaService],
})
export class PresModHistoryModule {}
