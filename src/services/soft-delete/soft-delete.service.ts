import { Injectable, BadRequestException, Global } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Injectable()
export class SoftDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async softDelete(model: string, id: string) {
    try {
      const entity = await this.prisma[model].findUnique({ where: { id } });

      if (!entity) {
        throw new BadRequestException(`${model} no encontrado.`);
      }

      if (entity.deleted_at) {
        throw new BadRequestException(`${model} ya ha sido eliminado.`);
      }

      await this.prisma[model].update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      return { message: `${model} eliminado correctamente.` };
    } catch (error) {
      console.error(`Error al eliminar ${model}:`, error);
      throw new BadRequestException(`Error al eliminar ${model}.`);
    }
  }

  async restore(model: string, id: string) {
    try {
      const entity = await this.prisma[model].findUnique({ where: { id } });

      if (!entity) {
        throw new BadRequestException(`${model} no encontrado.`);
      }

      if (!entity.deleted_at) {
        throw new BadRequestException(`${model} ya está activo.`);
      }

      await this.prisma[model].update({
        where: { id },
        data: { deleted_at: null },
      });

      return { message: `${model} restaurado correctamente.` };
    } catch (error) {
      console.error(`Error al restaurar ${model}:`, error);
      throw new BadRequestException(`Error al restaurar ${model}.`);
    }
  }
}
