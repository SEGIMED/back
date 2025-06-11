import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCatIdentificationTypeDto } from './dto/create-cat-identification-type.dto';
import { UpdateCatIdentificationTypeDto } from './dto/update-cat-identification-type.dto';
import { CatIdentificationType } from './cat-identification-type.interface';
import { CacheService } from '../../common/cache/cache.service';
import {
  CacheResult,
  InvalidateCache,
} from '../../common/cache/cache.decorator';

@Injectable()
export class CatIdentificationTypeService {
  private readonly CACHE_PREFIX = 'cat_identification_type';
  private readonly CACHE_TTL = 7200; // 2 hours - longer for fairly static data

  constructor(
    private prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  @InvalidateCache('cat_identification_type')
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

  @CacheResult('cat_identification_type:findAll', 7200)
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

  @CacheResult('cat_identification_type:findByCountry', 7200)
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

  @CacheResult('cat_identification_type:findOne', 7200)
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

  @InvalidateCache('cat_identification_type')
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

  @InvalidateCache('cat_identification_type')
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

  /**
   * Alternative manual caching approach for more complex scenarios
   */
  async findByCountryCached(country: string): Promise<CatIdentificationType[]> {
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      'findByCountry',
      country.toLowerCase(),
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.cat_identification_type.findMany({
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
      },
      this.CACHE_TTL,
    );
  }

  /**
   * Batch operations with smart cache invalidation
   */
  async createMany(
    createDtos: CreateCatIdentificationTypeDto[],
  ): Promise<{ count: number }> {
    try {
      const result = await this.prisma.cat_identification_type.createMany({
        data: createDtos,
      });

      // Invalidate cache after batch operation
      this.cacheService.invalidateCatalog(this.CACHE_PREFIX);

      return result;
    } catch (error) {
      throw new BadRequestException(
        'Error al crear los tipos de identificación: ' + error.message,
      );
    }
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  async warmCache(): Promise<void> {
    try {
      // Preload all identification types
      await this.findAll();

      // Preload common countries
      const commonCountries = ['Argentina', 'Chile', 'Colombia', 'Peru'];
      await Promise.all(
        commonCountries.map((country) => this.findByCountry(country)),
      );

      console.log('Cache warmed for identification types');
    } catch (error) {
      console.error('Error warming cache for identification types:', error);
    }
  }
}
