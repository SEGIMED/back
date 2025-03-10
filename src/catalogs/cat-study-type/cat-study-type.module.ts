import { Module } from '@nestjs/common';
import { CatStudyTypeService } from './cat-study-type.service';
import { CatStudyTypeController } from './cat-study-type.controller';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust the path as necessary

@Module({
  imports: [],
  controllers: [CatStudyTypeController],
  providers: [CatStudyTypeService, PrismaService],
})
export class CatStudyTypeModule {}
