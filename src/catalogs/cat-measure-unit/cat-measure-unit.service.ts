import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCatMeasureUnitDto } from './dto/create-cat-measure-unit.dto';

@Injectable()
export class CatMeasureUnitService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCatMeasureUnitDto) {
    try {
      // Check if vital sign exists
      const vitalSign = await this.prisma.cat_vital_signs.findUnique({
        where: { id: data.cat_vital_signs_id },
      });

      if (!vitalSign) {
        throw new BadRequestException('El signo vital asociado no existe');
      }

      // Check if measure unit with the same name already exists for this vital sign
      const existingMeasureUnit = await this.prisma.cat_measure_unit.findFirst({
        where: {
          name: data.name,
          cat_vital_signs: {
            some: {
              id: data.cat_vital_signs_id,
            },
          },
        },
      });

      if (existingMeasureUnit) {
        throw new BadRequestException(
          'Ya existe una unidad de medida con este nombre para este signo vital',
        );
      }

      // Create the measure unit
      return await this.prisma.cat_measure_unit.create({
        data: {
          name: data.name,
          description: data.description,
          cat_vital_signs: {
            connect: { id: data.cat_vital_signs_id },
          },
        },
        include: {
          cat_vital_signs: true,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la unidad de medida');
    }
  }

  async findAll(vitalSignId?: number) {
    try {
      if (vitalSignId) {
        // Filter by vital sign ID
        return await this.prisma.cat_measure_unit.findMany({
          where: {
            cat_vital_signs: {
              some: {
                id: vitalSignId,
              },
            },
          },
          include: {
            cat_vital_signs: true,
          },
        });
      } else {
        // Return all measure units
        return await this.prisma.cat_measure_unit.findMany({
          include: {
            cat_vital_signs: true,
          },
        });
      }
    } catch {
      throw new BadRequestException('Error al obtener las unidades de medida');
    }
  }

  async remove(id: number) {
    try {
      // Check if measure unit exists
      const measureUnit = await this.prisma.cat_measure_unit.findUnique({
        where: { id },
      });

      if (!measureUnit) {
        throw new NotFoundException('Unidad de medida no encontrada');
      }

      // Delete the measure unit
      return await this.prisma.cat_measure_unit.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la unidad de medida');
    }
  }
}
