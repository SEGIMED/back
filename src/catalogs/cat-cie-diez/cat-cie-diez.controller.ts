import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CatCieDiezService } from './cat-cie-diez.service';
import { CreateCatCieDiezDto } from './dto/create-cat-cie-diez.dto';
import { UpdateCatCieDiezDto } from './dto/update-cat-cie-diez.dto';
import { PaginationParams } from 'src/utils/pagination.helper';

@Controller('cat-cie-diez')
export class CatCieDiezController {
  constructor(private readonly catCieDiezService: CatCieDiezService) {}

  @Post()
  create(@Body() createCatCieDiezDto: CreateCatCieDiezDto) {
    return this.catCieDiezService.create(createCatCieDiezDto);
  }

  @Get()
  findAll(@Query() paginationParams: PaginationParams) {
    return this.catCieDiezService.findAll(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catCieDiezService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCatCieDiezDto: UpdateCatCieDiezDto,
  ) {
    return this.catCieDiezService.update(+id, updateCatCieDiezDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catCieDiezService.remove(+id);
  }
}
