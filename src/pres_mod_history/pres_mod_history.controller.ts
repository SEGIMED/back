import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PresModHistoryService } from './pres_mod_history.service';
import { CreatePresModHistoryDto } from './dto/create-pres_mod_history.dto';
import { UpdatePresModHistoryDto } from './dto/update-pres_mod_history.dto';

@Controller('pres-mod-history')
export class PresModHistoryController {
  constructor(private readonly presModHistoryService: PresModHistoryService) {}

  @Post()
  create(@Body() createPresModHistoryDto: CreatePresModHistoryDto) {
    return this.presModHistoryService.create(createPresModHistoryDto);
  }

  @Get()
  findAll() {
    return this.presModHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.presModHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePresModHistoryDto: UpdatePresModHistoryDto) {
    return this.presModHistoryService.update(+id, updatePresModHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.presModHistoryService.remove(+id);
  }
}
