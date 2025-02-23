import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CatStudyType } from './cat-study-type.interface';

@Injectable()
export class CatStudyTypeService {
  constructor(private prisma: PrismaService) {}

  async create(data: CatStudyType): Promise<CatStudyType> {
    return this.prisma.cat_study_type.create({
      data,
    });
  }

  async findAll(): Promise<CatStudyType[]> {
    return this.prisma.cat_study_type.findMany();
  }

  async findOne(id: string): Promise<CatStudyType> {
    return this.prisma.cat_study_type.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: CatStudyType): Promise<CatStudyType> {
    return this.prisma.cat_study_type.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<CatStudyType> {
    return this.prisma.cat_study_type.delete({
      where: { id },
    });
  }
}