import { Module } from '@nestjs/common';
import { CatCieDiezService } from './cat-cie-diez.service';
import { CatCieDiezController } from './cat-cie-diez.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CatCieDiezController],
  providers: [CatCieDiezService, PrismaService],
})
export class CatCieDiezModule {}
