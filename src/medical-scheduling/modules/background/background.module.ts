import { Module } from '@nestjs/common';
import { BackgroundController } from './background.controller';
import { BackgroundService } from './background.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BackgroundController],
  providers: [BackgroundService, PrismaService],
})
export class BackgroundModule {}
