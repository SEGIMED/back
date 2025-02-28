import { Injectable } from '@nestjs/common';
import { CreatePresModHistoryDto } from './dto/create-pres_mod_history.dto';
import { UpdatePresModHistoryDto } from './dto/update-pres_mod_history.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PresModHistoryService {

  constructor(private readonly prisma: PrismaService){}

  async create(createPresModHistoryDto: CreatePresModHistoryDto) {
    try {
      const history = await this.prisma.pres_mod_history.create({
        data: {...createPresModHistoryDto}
      })
      return {message: 'La historia ha sido creada'}
    } catch (error) {
      throw new Error(`No se ha podido generar la historia ${error.message}`)
    }
  }

  async findByPrescription_id(id: string){
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: {prescription_id: id}
      })
      return search
    } catch (error) {
      throw new Error(`No se ha podido consultar por prescripción ${error.message}`)
    }
  }

  async findByPhysician_id(id: string){
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: {physician_id: id}
      })
      return search
    } catch (error) {
      throw new Error(`No se ha podido consultar por médico ${error.message}`)
    }
  }

  async findByMedical_event_id(id: string){
    try {
      const search = await this.prisma.pres_mod_history.findMany({
        where: {medical_event_id: id}
      })
      return search
    } catch (error) {
      throw new Error(`No se ha podido consultar por evento médico ${error.message}`)
    }
  }
}
