import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCatVitalSignsDto } from './dto/create-cat-vital-signs.dto';

@Injectable()
export class CatVitalSignsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCatVitalSignsDto) {
    try {
      const existingVitalSign = await this.prisma.cat_vital_signs.findFirst({
        where: { name: data.name },
      });

      if (existingVitalSign) {
        throw new BadRequestException(
          'Ya existe un signo vital con este nombre',
        );
      }

      return await this.prisma.cat_vital_signs.create({
        data: {
          name: data.name,
          category: data.category,
          specialties: {
            connect: data.specialties.map((id) => ({ id })),
          },
          color: data.color,
          mini_icon: data.mini_icon,
          icon: data.icon,
          background_icon: data.background_icon,
          normal_min_value: data.normal_min_value,
          normal_max_value: data.normal_max_value,
          slightly_high_value: data.slightly_high_value,
          high_max_value: data.high_max_value,
          critical_max_value: data.critical_max_value,
          cat_measure_unit_id: data.cat_measure_unit_id,
        },
        include: {
          specialties: true,
          cat_measure_unit: true,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el signo vital');
    }
  }

  async findById(id: number) {
    try {
      const vitalSign = await this.prisma.cat_vital_signs.findUnique({
        where: { id },
        include: {
          specialties: true,
          cat_measure_unit: true,
        },
      });

      if (!vitalSign) {
        throw new NotFoundException('Signo vital no encontrado');
      }

      return vitalSign;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener el signo vital');
    }
  }

  async findAll(specialtyIds?: number[]) {
    try {
      const filterSpecialtyIds = specialtyIds?.length ? specialtyIds : [1];

      return await this.prisma.cat_vital_signs.findMany({
        where: {
          specialties: {
            some: {
              id: {
                in: filterSpecialtyIds,
              },
            },
          },
        },
        include: {
          specialties: true,
          cat_measure_unit: true,
        },
      });
    } catch {
      throw new BadRequestException('Error al obtener los signos vitales');
    }
  }

  async remove(id: number) {
    try {
      const vitalSign = await this.prisma.cat_vital_signs.findUnique({
        where: { id },
        include: {
          vital_signs: true,
        },
      });

      if (!vitalSign) {
        throw new NotFoundException('Signo vital no encontrado');
      }

      if (vitalSign.vital_signs.length > 0) {
        throw new BadRequestException(
          'No se puede eliminar un signo vital que está en uso',
        );
      }

      return await this.prisma.cat_vital_signs.delete({
        where: { id },
        include: {
          specialties: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el signo vital');
    }
  }
}
