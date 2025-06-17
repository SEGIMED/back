import { Module } from '@nestjs/common';
import { CatIdentificationTypeService } from './cat-identification-type.service';
import { CatIdentificationTypeController } from './cat-identification-type.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [CatIdentificationTypeController],
  providers: [CatIdentificationTypeService, PrismaService],
  exports: [CatIdentificationTypeService],
})
export class CatIdentificationTypeModule {}
