import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { physicalSubsystem } from './physical_subsystem.interface';
import { PaginationParams, parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class PhysicalSubsystemService {

    constructor(private readonly prisma: PrismaService){}

    async create(physicalSubsystem: physicalSubsystem){
        try {
            const phy_sub = await this.prisma.physical_subsystem.create({
                data: physicalSubsystem
            })
            return {message: 'El subsistema físico ha sido creado'}
        } catch (error) {
            return {message: 'Error al crear el subsistema', Error: error}
        }
    }

    async findOneById(id: string){
        try {
            const phy_sub = await this.prisma.physical_subsystem.findUnique({ where: {id: id}})
            if(phy_sub){
                return phy_sub
            }else{
                return {message: 'El valor solicitado no existe'}
            }
        } catch (error) {
            return {message: 'Error al buscar el subsistema', Error: error}
        }
    }

    async findAll(pagination: PaginationParams){
        const { skip, take, orderBy, orderDirection } = parsePaginationAndSorting(pagination)
        try {
            const phy_subs = await this.prisma.physical_subsystem.findMany({
                take, skip,
                orderBy: { [orderBy]: orderDirection },

            })
            if(phy_subs.length > 0){
                return phy_subs
            }else{
                return {message: 'No existen datos'}
            }
        } catch (error) {
            return {message: 'Error al buscar los subsistemas', Error: error}
        }
    }
}
