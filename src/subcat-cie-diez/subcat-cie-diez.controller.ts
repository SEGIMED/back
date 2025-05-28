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
import { SubcatCieDiezService } from './subcat-cie-diez.service';
import { CreateSubcatCieDiezDto } from './dto/create-subcat-cie-diez.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import { UpdateSubcatCieDiezDto } from 'src/catalogs/subcat-cie-diez/dto/update-subcat-cie-diez.dto';

@Controller('subcat-cie-diez')
export class SubcatCieDiezController {
  constructor(private readonly subcatCieDiezService: SubcatCieDiezService) {}

  @Post()
  create(@Body() createSubcatCieDiezDto: CreateSubcatCieDiezDto) {
    return this.subcatCieDiezService.create(createSubcatCieDiezDto);
  }

  @Get()
  findAll(@Query() paginationParams: PaginationParams) {
    return this.subcatCieDiezService.findAll(paginationParams);
  }

  @Get('search')
  search(@Query('searchWord') searchWord: string) {
    return this.subcatCieDiezService.search(searchWord);
  }

  @Get('category/:id')
  findAllCategories(
    @Param('id') id: number,
    @Query() paginationParams: PaginationParams,
  ) {
    return this.subcatCieDiezService.findAllCategories(id, paginationParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcatCieDiezService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubcatCieDiezDto: UpdateSubcatCieDiezDto,
  ) {
    return this.subcatCieDiezService.update(+id, updateSubcatCieDiezDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcatCieDiezService.remove(+id);
  }
}
