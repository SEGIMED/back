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
import { UpdateSubcatCieDiezDto } from './dto/update-subcat-cie-diez.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Catalogs - CIE-10 Subcategories')
@ApiBearerAuth('access-token')
@Controller('subcat-cie-diez')
export class SubcatCieDiezController {
  constructor(private readonly subcatCieDiezService: SubcatCieDiezService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una subcategoría CIE-10' })
  @ApiBody({ type: CreateSubcatCieDiezDto })
  @ApiResponse({
    status: 201,
    description: 'La subcategoría CIE-10 ha sido creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida (datos faltantes o incorrectos).',
  })
  create(@Body() createSubcatCieDiezDto: CreateSubcatCieDiezDto) {
    return this.subcatCieDiezService.create(createSubcatCieDiezDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las subcategorías CIE-10' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página para la paginación',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Número de ítems por página',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo por el cual ordenar los resultados',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Dirección de la ordenación (asc o desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategorías CIE-10 recuperadas exitosamente.',
  })
  findAll(@Query() paginationParams: PaginationParams) {
    return this.subcatCieDiezService.findAll(paginationParams);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar subcategorías CIE-10 por palabra clave' })
  @ApiQuery({
    name: 'searchWord',
    required: true,
    description: 'Palabra clave para buscar subcategorías CIE-10',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategorías CIE-10 encontradas.',
  })
  search(@Query('searchWord') searchWord: string) {
    return this.subcatCieDiezService.search(searchWord);
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Obtener subcategorías CIE-10 por categoría' })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría CIE-10',
    type: 'number',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página para la paginación',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Número de ítems por página',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Campo por el cual ordenar los resultados',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Dirección de la ordenación (asc o desc)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Subcategorías CIE-10 de la categoría especificada recuperadas exitosamente.',
  })
  findAllCategories(
    @Param('id') id: number,
    @Query() paginationParams: PaginationParams,
  ) {
    return this.subcatCieDiezService.findAllCategories(id, paginationParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una subcategoría CIE-10 por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la subcategoría CIE-10',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategoría CIE-10 recuperada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description:
      'La subcategoría CIE-10 con el ID especificado no fue encontrada.',
  })
  findOne(@Param('id') id: string) {
    return this.subcatCieDiezService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una subcategoría CIE-10' })
  @ApiParam({
    name: 'id',
    description: 'ID de la subcategoría CIE-10 a actualizar',
    type: 'number',
  })
  @ApiBody({ type: UpdateSubcatCieDiezDto })
  @ApiResponse({
    status: 200,
    description: 'La subcategoría CIE-10 ha sido actualizada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description:
      'La subcategoría CIE-10 con el ID especificado no fue encontrada.',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida.',
  })
  update(
    @Param('id') id: string,
    @Body() updateSubcatCieDiezDto: UpdateSubcatCieDiezDto,
  ) {
    return this.subcatCieDiezService.update(+id, updateSubcatCieDiezDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una subcategoría CIE-10' })
  @ApiParam({
    name: 'id',
    description: 'ID de la subcategoría CIE-10 a eliminar',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'La subcategoría CIE-10 ha sido eliminada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description:
      'La subcategoría CIE-10 con el ID especificado no fue encontrada.',
  })
  remove(@Param('id') id: string) {
    return this.subcatCieDiezService.remove(+id);
  }
}
