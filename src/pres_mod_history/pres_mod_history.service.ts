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
      
    }
  }

  findAll() {
    return `This action returns all presModHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} presModHistory`;
  }

  update(id: number, updatePresModHistoryDto: UpdatePresModHistoryDto) {
    return `This action updates a #${id} presModHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} presModHistory`;
  }
}
