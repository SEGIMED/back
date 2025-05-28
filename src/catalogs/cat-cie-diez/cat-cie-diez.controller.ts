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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CatCieDiezService } from './cat-cie-diez.service';
import { CreateCatCieDiezDto } from './dto/create-cat-cie-diez.dto';
import { UpdateCatCieDiezDto } from './dto/update-cat-cie-diez.dto';
import { PaginationParams } from 'src/utils/pagination.helper';

@ApiTags('Catalogs - CIE-10')
@Controller('cat-cie-diez')
export class CatCieDiezController {
  constructor(private readonly catCieDiezService: CatCieDiezService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CIE-10 category' })
  @ApiBody({ type: CreateCatCieDiezDto })
  @ApiResponse({
    status: 201,
    description: 'The CIE-10 category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createCatCieDiezDto: CreateCatCieDiezDto) {
    return this.catCieDiezService.create(createCatCieDiezDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CIE-10 categories with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order direction (asc or desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CIE-10 categories.',
  })
  findAll(@Query() paginationParams: PaginationParams) {
    return this.catCieDiezService.findAll(paginationParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a CIE-10 category by ID' })
  @ApiParam({ name: 'id', description: 'CIE-10 category ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CIE-10 category.',
  })
  @ApiResponse({ status: 404, description: 'CIE-10 category not found.' })
  findOne(@Param('id') id: string) {
    return this.catCieDiezService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CIE-10 category by ID' })
  @ApiParam({ name: 'id', description: 'CIE-10 category ID', type: Number })
  @ApiBody({ type: UpdateCatCieDiezDto })
  @ApiResponse({
    status: 200,
    description: 'The CIE-10 category has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'CIE-10 category not found.' })
  update(
    @Param('id') id: string,
    @Body() updateCatCieDiezDto: UpdateCatCieDiezDto,
  ) {
    return this.catCieDiezService.update(+id, updateCatCieDiezDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CIE-10 category by ID' })
  @ApiParam({ name: 'id', description: 'CIE-10 category ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The CIE-10 category has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'CIE-10 category not found.' })
  remove(@Param('id') id: string) {
    return this.catCieDiezService.remove(+id);
  }
}
