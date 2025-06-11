import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatCieDiezDto } from './dto/create-cat-cie-diez.dto';
import { UpdateCatCieDiezDto } from './dto/update-cat-cie-diez.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
import { CacheService } from 'src/common/cache/cache.service';
import { CacheResult, InvalidateCache } from 'src/common/cache/cache.decorator';

@Injectable()
export class CatCieDiezService {
  private readonly CACHE_PREFIX = 'cat_cie_diez';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @InvalidateCache('cat_cie_diez')
  async create(createCatCieDiezDto: CreateCatCieDiezDto): Promise<object> {
    try {
      await this.prisma.category_cie_diez.create({
        data: { ...createCatCieDiezDto },
      });
      return { message: 'La categoría ha sido correctamente creada' };
    } catch (error) {
      return { message: `Error al crear la categoria ${error.message}` };
    }
  }

  @CacheResult('cat_cie_diez:findAll', 3600)
  async findAll(paginationParams: PaginationParams) {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(paginationParams);

      const categories = await this.prisma.category_cie_diez.findMany({
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      });
      return categories;
    } catch (error) {
      return { message: `Error al consultar las categorias ${error.message}` };
    }
  }

  @CacheResult('cat_cie_diez:findOne', 3600)
  async findOne(id: number) {
    try {
      const category = await this.prisma.category_cie_diez.findUnique({
        where: {
          id: id,
        },
      });
      if (!category) throw new NotFoundException('No existe la categoria');

      return category;
    } catch (error) {
      return { message: `Error al consultar la categoria ${error.message}` };
    }
  }

  @InvalidateCache('cat_cie_diez')
  async update(id: number, updateCatCieDiezDto: UpdateCatCieDiezDto) {
    try {
      await this.prisma.category_cie_diez.update({
        where: { id: id },
        data: { ...updateCatCieDiezDto },
      });
      return { message: 'La categoría ha sido correctamente actualizada' };
    } catch (error) {
      return { message: `Error al actualizar la categoria ${error.message}` };
    }
  }

  @InvalidateCache('cat_cie_diez')
  async remove(id: number) {
    try {
      await this.prisma.category_cie_diez.delete({
        where: { id: id },
      });
      return { message: 'La categoría ha sido correctamente eliminada' };
    } catch (error) {
      return { message: `Error al eliminar la categoria ${error.message}` };
    }
  }

  /**
   * Alternative method using CacheService directly for more control
   */
  async findAllCached(paginationParams: PaginationParams) {
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      'findAll',
      JSON.stringify(paginationParams),
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const { skip, take, orderBy, orderDirection } =
          parsePaginationAndSorting(paginationParams);

        return this.prisma.category_cie_diez.findMany({
          skip,
          take,
          orderBy: { [orderBy]: orderDirection },
        });
      },
      this.CACHE_TTL,
    );
  }

  /**
   * Alternative method using CacheService directly for findOne
   */
  async findOneCached(id: number) {
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      'findOne',
      id,
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const category = await this.prisma.category_cie_diez.findUnique({
          where: { id },
        });
        if (!category) {
          throw new NotFoundException('No existe la categoria');
        }
        return category;
      },
      this.CACHE_TTL,
    );
  }
}
