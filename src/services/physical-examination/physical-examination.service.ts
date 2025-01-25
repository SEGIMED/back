import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { physicalExaminationDto } from './physical_examination.interface';

@Injectable()
export class PhysicalExaminationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    physical_examinations: physicalExaminationDto[],
  ): Promise<object> {
    try {
      const result = [];
      for (const physical_examination of physical_examinations) {
        const { physical_subsystem_id, medical_event_id, patient_id, ...rest } =
          physical_examination;

        const patient = await this.prisma.patient.findUnique({
          where: { id: patient_id },
        });
        if (!patient) {
          result.push({
            patient_id,
            message: 'El paciente no existe',
          });
          continue;
        }

        if (physical_subsystem_id) {
          const existingRelation =
            await this.prisma.physical_examination.findFirst({
              where: {
                medical_event_id,
                physical_subsystem_id,
              },
            });

          if (existingRelation) {
            result.push({
              patient_id,
              message:
                'Ya existe un examen físico con el mismo subsistema y evento médico',
            });
            continue;
          }
        }

        const phy_exa = await this.prisma.physical_examination.create({
          data: {
            ...rest,
            medical_event: { connect: { id: medical_event_id } },
            user: { connect: { id: patient_id } },
            ...(physical_subsystem_id && {
              physical_subsystem: { connect: { id: physical_subsystem_id } },
            }),
          },
        });

        if (phy_exa.id) {
          result.push({
            patient_id,
            message: 'El examen físico ha sido correctamente generado',
          });
        } else {
          result.push({
            patient_id,
            message: 'Error al crear el Examen Físico',
          });
        }
      }
      return result;
    } catch (error) {
      return {
        message: 'Error al crear los Exámenes Físicos',
        error: error.message || error,
      };
    }
  }

  async findOneById(id: string) {
    try {
      const phy_exa = await this.prisma.physical_examination.findUnique({
        where: { id: id },
      });

      if (!phy_exa) throw new Error('El examen físico no existe');

      return phy_exa;
    } catch (error) {
      return { message: 'Error al buscar el exámen', Error: error };
    }
  }

  async findAll(pagination: PaginationParams, patient_id: string) {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(pagination);
    try {
      const phy_exas = await this.prisma.physical_examination.findMany({
        where: { patient_id: patient_id },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });
      if (phy_exas.length > 0) {
        return phy_exas;
      } else {
        return { message: 'No existen datos' };
      }
    } catch (error) {
      return { message: 'Error al buscar los exámenes', Error: error };
    }
  }
}
