import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubcatCieDiezDto } from './dto/create-subcat-cie-diez.dto';
import { UpdateSubcatCieDiezDto } from './dto/update-subcat-cie-diez.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubcatCieDiezService {

  constructor(private readonly prisma: PrismaService){}
  async create(createSubcatCieDiezDto: CreateSubcatCieDiezDto) {
    try {
      const category = await this.prisma.category_cie_diez.findUnique({where: {id: createSubcatCieDiezDto.categoryId}})

      if(!category) throw new NotFoundException('No se encuentra la categoria')
        
      const subCat = await this.prisma.subcategories_cie_diez.create({
        data: {
          ...createSubcatCieDiezDto
        },
      })

      if(!subCat) throw new Error('No se ha podido generar la sub categoria')

      return subCat
    } catch (error) {
      return {message: 'Error al generar la subcategoria', Error: error}
    }
  }

  async findAll() {
    try {
      const subcategories = await this.prisma.subcategories_cie_diez.findMany()
      return subcategories
    } catch (error) {
      return {message: 'Error al consultar las subcategorias', Error: error}
    }
  }

  async findOne(id: number) {
    try {
      const subcategory = await this.prisma.subcategories_cie_diez.findUnique({where: {id: id}})
      if(!subcategory) throw new NotFoundException('No se encontró la sub categoria')
      return subcategory
    } catch (error) {
      return {message: 'Error al consultar la subcategoria', Error: error}
    }
  }

  async update(id: number, updateSubcatCieDiezDto: UpdateSubcatCieDiezDto) {
    try {
      const subcategory = await this.prisma.subcategories_cie_diez.update({
        where: {id: id},
        data: {...updateSubcatCieDiezDto}
      })
      return 'La categoria ha sido correctamente actualizada'
    } catch (error) {
      return {message: 'Error al actualizar la subcategoria', Error: error}
    }
  }

  async remove(id: number) {
    try {
      const subcategory = this.prisma.subcategories_cie_diez.delete({where: {id: id}})
      if(!subcategory) throw new NotFoundException('No se encontró la subcategoria')
      return 'La categoria se ha eliminado correctamente'
    } catch (error) {
      return {message: 'Error al eliminar la subcategoria', Error: error}
    }
  }

  async findAllCategories(id: number){
    try {
      const subcategories = await this.prisma.subcategories_cie_diez.findMany({
        where: {categoryId: +id}
      })
      return subcategories
    } catch (error) {
      console.log(error);
      return {message: 'Error al consultar las subcategorias', Error: error}
    }
  }
}
