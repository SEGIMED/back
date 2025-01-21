import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { physicalExamination } from './physical_examination.interface';
import { PaginationParams, parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class PhysicalExaminationService {

    constructor(private readonly prisma: PrismaService){}

    async create(physical_examination: physicalExamination): Promise<Object>{
        try {
            const phy_exa = await this.prisma.physical_examination.create({
                data: physical_examination as any
            })
            if(phy_exa.id){
                return {message: 'El exámen físico ha sido correctamente generado', Physical_examination: phy_exa}
            }else{
                return {message: 'Error al crear el registro'}
            }
        } catch (error) {
            return {message: 'Error al crear el Exámen Físico', Error: error}
        }
    }

    async findOneById(id: string){
        try {
            const phy_exa = await this.prisma.physical_examination.findUnique({ where: {id: id}})
            if(phy_exa){
                return phy_exa
            }else{
                return {message: 'El valor solicitado no existe'}
            }
        } catch (error) {
            return {message: 'Error al buscar el exámen', Error: error}
        }
    }

    async findAll(pagination: PaginationParams){
        const { skip, take, orderBy, orderDirection } = parsePaginationAndSorting(pagination)
        try {
            const phy_exas = await this.prisma.physical_examination.findMany({
                take, skip,
                orderBy: { [orderBy]: orderDirection },

            })
            if(phy_exas.length > 0){
                return phy_exas
            }else{
                return {message: 'No existen datos'}
            }
        } catch (error) {
            return {message: 'Error al buscar los exámenes', Error: error}
        }
    }
}
