import { Module } from '@nestjs/common';
import { PresModHistoryService } from './pres_mod_history.service';
import { PresModHistoryController } from './pres_mod_history.controller';

@Module({
  controllers: [PresModHistoryController],
  providers: [PresModHistoryService],
})
export class PresModHistoryModule {}
