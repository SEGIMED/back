import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationParams, parsePaginationAndSorting } from 'src/utils/pagination.helper';

@Injectable()
export class OrderTypeService {

  constructor(private readonly prisma: PrismaService){}

  async create(createOrderTypeDto: CreateOrderTypeDto) {
    try {
      const orderType = await this.prisma.medical_order_type.create({
        data: {...createOrderTypeDto}
      })
      return {message: 'Tipo de orden médica creada con éxito'}
    } catch (error) {
      return {message: `No se ha podido generar el tipo de orden médica ${error.message}`}
    }
  }

  async findAll(paginationParams: PaginationParams) {
    try {
      const { skip, take, orderBy, orderDirection } = parsePaginationAndSorting(paginationParams);
      const ordersType = await this.prisma.medical_order_type.findMany({
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
      })
      return ordersType
    } catch (error) {
      return {message: `No se ha podido consultar los tipo de orden médica ${error.message}`}
    }
  }

  async findOne(id: string) {
    try {
      const orderType = await this.prisma.medical_order_type.findFirst({
        where: {id: id}
      })
      if(!orderType) throw new NotFoundException('No se ha encontrado el id solicitado')
      return orderType
    } catch (error) {
      return {message: `No se ha podido consultar el tipo de orden médica ${error.message}`}
    }
  }

  async update(id: string, updateOrderTypeDto: UpdateOrderTypeDto) {
    try {
      const orderType = await this.prisma.medical_order_type.update({
        where: {id: id},
        data: {...updateOrderTypeDto}
      })
      return {message: 'Tipo de orden médica actualizada con éxito'}
    } catch (error) {
      return {message: `No se ha podido actualizar el tipo de orden médica ${error.message}`}
    }
  }
}
