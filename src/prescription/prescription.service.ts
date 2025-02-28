import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrescriptionService {

  constructor(private readonly prisma: PrismaService){}
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    try {
      const prescription = await this.prisma.prescription.create({
        data: {...createPrescriptionDto}
      })
      return {message: 'La prescripción ha sido correctamente generada'}
    } catch (error) {
      throw new Error(`No se ha podido generar la prescripción ${error.message}`)
    }
  }

  async findAll() {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          active: true
        }
      })
      return prescriptions
    } catch (error) {
      throw new Error(`No se ha podido consultar las prescripciones ${error.message}`)
    }
  }

  async findAllById(id: string) {
    try {
      const prescriptions = await this.prisma.prescription.findMany({
        where: {
          AND: [
            { active: true},
            { patient_id: id}
          ]
        }
      })
      return prescriptions
    } catch (error) {
      throw new Error(`No se ha podido consultar las prescripciones ${error.message}`)
    }
  }

  async remove(id: string) {
    try {
      const prescription = await this.prisma.prescription.update({
        where: { id: id},
        data: {active: false}
      })
      if(!prescription) throw new NotFoundException('La prescripción no ha sido localizada')
      return {message: 'La prescripción ha sido eliminada'}
    } catch (error) {
      throw new Error(`No se ha podido eliminar la prescripción ${error.message}`)
    }
  }
}
