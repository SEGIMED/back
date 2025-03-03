import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { PatientStudy } from './entities/patient-study.interface';

@Injectable()
export class PatientStudiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPatientStudyDto: CreatePatientStudyDto,
  ): Promise<PatientStudy> {
    return await this.prisma.patient_study.create({
      data: {
        ...createPatientStudyDto,
        is_deleted: false,
      },
    });
  }

  async findAll(): Promise<PatientStudy[]> {
    return this.prisma.patient_study.findMany({
      where: { is_deleted: false },
    });
  }

  async findOne(id: string): Promise<PatientStudy> {
    return this.prisma.patient_study.findFirst({
      where: { id, is_deleted: false },
    });
  }

  async update(
    id: string,
    updatePatientStudyDto: UpdatePatientStudyDto,
  ): Promise<PatientStudy> {
    return this.prisma.patient_study.update({
      where: { id },
      data: updatePatientStudyDto,
    });
  }

  async remove(id: string): Promise<PatientStudy> {
    return this.prisma.patient_study.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}
