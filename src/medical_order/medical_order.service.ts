import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalOrderDto } from './dto/create-medical_order.dto';
import { UpdateMedicalOrderDto } from './dto/update-medical_order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicalOrderService {

  constructor(private readonly prisma: PrismaService){}

  async create(createMedicalOrderDto: CreateMedicalOrderDto) {
    try {
      const medicalOrder = await this.prisma.medical_order.create({
        data: {...createMedicalOrderDto}
      })
      return {message: 'Se ha creado correctamente la orden médica'}
    } catch (error) {
      return {message: `No se ha podido generar la orden médica ${error.message}`}
    }
  }

  async findAll() {
    try {
      const orders = await this.prisma.medical_order.findMany()
      return orders
    } catch (error) {
      return {message: `No se ha podido consultar las ordenes médicas ${error.message}`}
    }
  }

  async findOne(id: string) {
    try {
      const medicalOrder = await this.prisma.medical_order.findUnique({
        where: {id: id}
      })
      if(!medicalOrder) throw new NotFoundException('No se ha podido encontrar la orden médica')
    } catch (error) {
      return {message: `No se ha podido consultar la orden médica ${error.message}`}
    }
  }

  async update(id: string, updateMedicalOrderDto: UpdateMedicalOrderDto) {
    try {
      await this.prisma.medical_order.update({
        where: {id: id},
        data: {...updateMedicalOrderDto}
      })
      return {message: 'Se ha actualizado correctamente la orden'}
    } catch (error) {
      return {message: `No se ha podido actualizar la orden médica ${error.message}`}
    }
  }

  async remove(id: string) {
    return `This action removes a #${id} medicalOrder`;
  }
}
