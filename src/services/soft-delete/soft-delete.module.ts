import { Module } from '@nestjs/common';
import { SoftDeleteService } from './soft-delete.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SoftDeleteService],
  exports: [SoftDeleteService],
})
export class SoftDeleteModule {}
