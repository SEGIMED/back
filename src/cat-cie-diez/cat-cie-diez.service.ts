import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatCieDiezDto } from './dto/create-cat-cie-diez.dto';
import { UpdateCatCieDiezDto } from './dto/update-cat-cie-diez.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CatCieDiez } from './entities/cat-cie-diez.entity';
import { PaginationParams, parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class CatCieDiezService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCatCieDiezDto: CreateCatCieDiezDto): Promise<Object> {
    try {
      const user = await this.prisma.category_cie_diez.create({
        data: {...createCatCieDiezDto}
      })
      return {message: 'La categoría ha sido correctamente creada'}
    } catch (error) {
      return { message: `Error al crear la categoria ${error.message}`};
    }
  }

  async findAll(paginationParams: PaginationParams){
    try {
      const { skip, take, orderBy, orderDirection } = parsePaginationAndSorting(paginationParams);

      const categories = await this.prisma.category_cie_diez.findMany({
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      })
      return categories
    } catch (error) {
      return { message: `Error al consultar las categorias ${error.message}`};
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
      return { message: `Error al consultar la categoria ${error.message}`};
    }
  }

  async update(id: number, updateCatCieDiezDto: UpdateCatCieDiezDto) {
    try {
      const category = await this.prisma.category_cie_diez.update({
        where: {id: id},
        data: {...updateCatCieDiezDto}
      })
      return {message: 'La categoría ha sido correctamente actualizada'}
    } catch (error) {
      return { message: `Error al actualizar la categoria ${error.message}`};
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.category_cie_diez.delete({
        where: {id: id}
      })
      return {message: 'La categoría ha sido correctamente eliminada'}
    } catch (error) {
      return { message: `Error al eliminar la categoria ${error.message}`};
    }
  }
}
