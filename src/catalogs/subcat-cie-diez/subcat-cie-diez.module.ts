import { Module } from '@nestjs/common';
import { SubcatCieDiezService } from './subcat-cie-diez.service';
import { SubcatCieDiezController } from './subcat-cie-diez.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SubcatCieDiezController],
  providers: [SubcatCieDiezService, PrismaService],
})
export class SubcatCieDiezModule {}
