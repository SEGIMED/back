import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { CreateMedicalOrderDto } from './dto/create-medical_order.dto';
import { UpdateMedicalOrderDto } from './dto/update-medical_order.dto';

@Controller('medical-order')
export class MedicalOrderController {
  constructor(private readonly medicalOrderService: MedicalOrderService) {}

  @Post()
  create(@Body() createMedicalOrderDto: CreateMedicalOrderDto) {
    return this.medicalOrderService.create(createMedicalOrderDto);
  }

  @Get()
  findAll() {
    return this.medicalOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalOrderDto: UpdateMedicalOrderDto) {
    return this.medicalOrderService.update(id, updateMedicalOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalOrderService.remove(id);
  }
}
