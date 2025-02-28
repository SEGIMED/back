import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PresModHistoryService } from './pres_mod_history.service';
import { CreatePresModHistoryDto } from './dto/create-pres_mod_history.dto';

@Controller('pres-mod-history')
export class PresModHistoryController {
  constructor(private readonly presModHistoryService: PresModHistoryService) {}

  @Post()
  create(@Body() createPresModHistoryDto: CreatePresModHistoryDto) {
    return this.presModHistoryService.create(createPresModHistoryDto);
  }

  @Get('prescription/:id')
  findByPrescription_id(@Param('id') id: string){
    return this.presModHistoryService.findByPrescription_id(id)
  }

  @Get('physician/:id')
  findByPhysician_id(@Param('id') id: string){
    return this.presModHistoryService.findByPhysician_id(id)
  }

  @Get('medical_event/:id')
  findByMedical_event_id(@Param('id') id: string){
    return this.presModHistoryService.findByMedical_event_id(id)
  }

}
