import { Module } from '@nestjs/common';
import { CatMeasureUnitService } from './cat-measure-unit.service';
import { CatMeasureUnitController } from './cat-measure-unit.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from 'src/auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [CatMeasureUnitController],
  providers: [CatMeasureUnitService, PrismaService],
})
export class CatMeasureUnitModule {}
