import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatCieDiezDto } from './dto/create-cat-cie-diez.dto';
import { UpdateCatCieDiezDto } from './dto/update-cat-cie-diez.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CatCieDiez } from './entities/cat-cie-diez.entity';

@Injectable()
export class CatCieDiezService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCatCieDiezDto: CreateCatCieDiezDto): Promise<Object> {
    try {
      const user = await this.prisma.category_cie_diez.create({
        data: {...createCatCieDiezDto}
      })
      return user
    } catch (error) {
      return { message: 'La categoria no ha podido ser generada', Error: error };
    }
  }

  async findAll() {
    try {
      const categories = await this.prisma.category_cie_diez.findMany()
      return categories
    } catch (error) {
      return { message: 'Error al consultar las categorias', Error: error };
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.prisma.category_cie_diez.findUnique({
        where: {
          id: id
        }
      })
      if (!category) throw new NotFoundException('No existe la categoria')
        return category
    } catch (error) {
      return { message: 'Error al consultar las categorias', Error: error };
    }
  }

  async update(id: number, updateCatCieDiezDto: UpdateCatCieDiezDto) {
    try {
      const category = await this.prisma.category_cie_diez.update({
        where: {id: id},
        data: {...updateCatCieDiezDto}
      })
      return {message: 'La categoria ha sido actualizada', category: category}
    } catch (error) {
      return { message: 'No se ha podido actualizar la categoria', Error: error };
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.category_cie_diez.delete({
        where: {id: id}
      })
      return {message: 'La categoria ha sido eliminada'}
    } catch (error) {
      return { message: 'No se ha podido eliminar la categoria', Error: error };
    }
  }
}
