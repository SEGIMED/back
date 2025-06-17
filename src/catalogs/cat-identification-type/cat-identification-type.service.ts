import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCatIdentificationTypeDto } from './dto/create-cat-identification-type.dto';
import { UpdateCatIdentificationTypeDto } from './dto/update-cat-identification-type.dto';
import { CatIdentificationType } from './cat-identification-type.interface';

@Injectable()
export class CatIdentificationTypeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: CreateCatIdentificationTypeDto,
  ): Promise<CatIdentificationType> {
    try {
      return await this.prisma.cat_identification_type.create({
        data: createDto,
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al crear el tipo de identificación: ' + error.message,
      );
    }
  }

  async findAll(): Promise<CatIdentificationType[]> {
    try {
      return await this.prisma.cat_identification_type.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los tipos de identificación: ' + error.message,
      );
    }
  }

  async findByCountry(country: string): Promise<CatIdentificationType[]> {
    try {
      return await this.prisma.cat_identification_type.findMany({
        where: {
          country: {
            contains: country,
            mode: 'insensitive',
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los tipos de identificación por país: ' +
          error.message,
      );
    }
  }

  async findOne(id: number): Promise<CatIdentificationType> {
    try {
      const identificationType =
        await this.prisma.cat_identification_type.findUnique({
          where: { id },
        });

      if (!identificationType) {
        throw new NotFoundException('Tipo de identificación no encontrado');
      }

      return identificationType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al obtener el tipo de identificación: ' + error.message,
      );
    }
  }

  async update(
    id: number,
    updateDto: UpdateCatIdentificationTypeDto,
  ): Promise<CatIdentificationType> {
    try {
      // Verificar que existe
      await this.findOne(id);

      return await this.prisma.cat_identification_type.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al actualizar el tipo de identificación: ' + error.message,
      );
    }
  }

  async remove(id: number): Promise<CatIdentificationType> {
    try {
      // Verificar que existe
      await this.findOne(id);

      return await this.prisma.cat_identification_type.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al eliminar el tipo de identificación: ' + error.message,
      );
    }
  }
}
