import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CatStudyTypeService } from './cat-study-type.service';
import { CatStudyType } from './cat-study-type.interface';

@Controller('cat-study-type')
export class CatStudyTypeController {
  constructor(private readonly catStudyTypeService: CatStudyTypeService) {}

  @Post()
  async create(@Body() data: CatStudyType): Promise<CatStudyType> {
    return this.catStudyTypeService.create(data);
  }

  @Get()
  async findAll(): Promise<CatStudyType[]> {
    return this.catStudyTypeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CatStudyType> {
    return this.catStudyTypeService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: CatStudyType,
  ): Promise<CatStudyType> {
    return this.catStudyTypeService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<CatStudyType> {
    return this.catStudyTypeService.remove(id);
  }
}
