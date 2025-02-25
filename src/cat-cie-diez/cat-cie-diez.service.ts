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
      return {message: 'Éxito'}
    } catch (error) {
      return { message: 'Error' };
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
      return { message: 'Error' };
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
      return {message: 'Éxito'}
    } catch (error) {
      return {message: 'Error' };
    }
  }

  async remove(id: number) {
    try {
      const category = await this.prisma.category_cie_diez.delete({
        where: {id: id}
      })
      return {message: 'Éxito'}
    } catch (error) {
      return { message: 'error' };
    }
  }
}
