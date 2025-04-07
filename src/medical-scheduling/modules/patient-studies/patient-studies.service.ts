import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { PatientStudy } from './entities/patient-study.interface';

@Injectable()
export class PatientStudiesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPatientStudyDto: CreatePatientStudyDto,
    tenantId: string,
  ): Promise<PatientStudy> {
    createPatientStudyDto.cat_study_type_id = Number(
      createPatientStudyDto.cat_study_type_id,
    );
    return await this.prisma.patient_study.create({
      data: {
        ...createPatientStudyDto,
        is_deleted: false,
        tenant_id: tenantId,
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

  async findByPatientId(patientId: string): Promise<PatientStudy[]> {
    try {
      return this.prisma.patient_study.findMany({
        where: { patient_id: patientId, is_deleted: false },
      });
    } catch (error) {
      throw new BadRequestException('Ocurrio un error: ' + error.message);
    }
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
