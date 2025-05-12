import { Module } from '@nestjs/common';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [PrismaModule, GuardAuthModule],
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}
