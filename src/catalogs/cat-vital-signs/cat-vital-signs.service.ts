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
        },
        include: {
          specialties: true,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el signo vital');
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
          cat_vital_sign_measure: true,
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
