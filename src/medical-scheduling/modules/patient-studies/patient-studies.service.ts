import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreatePatientStudyDto,
  CreatePatientOwnStudyDto,
} from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { PatientStudy } from './entities/patient-study.interface';

@Injectable()
export class PatientStudiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene los tenant IDs del paciente de forma optimizada
   */
  private async getPatientTenantIds(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<string[]> {
    // Si los tenants vienen del JWT, usarlos directamente
    if (userTenants && userTenants.length > 0) {
      return userTenants.map((tenant) => tenant.id);
    }

    // Sino, buscar en la DB con el patient_id directamente
    const patientTenants = await this.prisma.patient_tenant.findMany({
      where: {
        patient: {
          user_id: patientId,
        },
        deleted: false,
      },
      select: { tenant_id: true },
    });

    return patientTenants.map((pt) => pt.tenant_id);
  }

  /**
   * Crea un estudio de paciente (método original para médicos)
   */
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

  /**
   * Crea un estudio propio del paciente (sin tenant, sin médico)
   */
  async createPatientOwnStudy(
    createPatientOwnStudyDto: CreatePatientOwnStudyDto,
    patientId: string,
  ): Promise<PatientStudy> {
    return await this.prisma.patient_study.create({
      data: {
        patient_id: patientId,
        physician_id: null, // No hay médico asignado para estudios propios
        title: createPatientOwnStudyDto.title,
        description: createPatientOwnStudyDto.description,
        cat_study_type_id: Number(createPatientOwnStudyDto.cat_study_type_id),
        url: createPatientOwnStudyDto.url || '',
        tenant_id: null, // Explícitamente null para estudios propios del paciente
        is_deleted: false,
      },
    });
  }

  /**
   * Crea un estudio de paciente por parte de un médico (physician_id del token)
   */
  async createByPhysician(
    createPatientStudyDto: CreatePatientStudyDto,
    physicianId: string, // ID del médico extraído del token
    tenantId: string,
  ): Promise<PatientStudy> {
    return await this.prisma.patient_study.create({
      data: {
        patient_id: createPatientStudyDto.patient_id,
        physician_id: physicianId, // Del token
        title: createPatientStudyDto.title,
        description: createPatientStudyDto.description,
        cat_study_type_id: Number(createPatientStudyDto.cat_study_type_id),
        url: createPatientStudyDto.url || '',
        tenant_id: tenantId,
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

  async findByPatientId(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<PatientStudy[]> {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(patientId, userTenants);

      return this.prisma.patient_study.findMany({
        where: {
          patient_id: patientId,
          is_deleted: false,
          OR: [
            // Estudios de organizaciones del paciente
            { tenant_id: { in: tenantIds } },
            // Estudios propios del paciente (sin tenant)
            { tenant_id: null },
          ],
        },
        include: {
          cat_study_type: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
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
