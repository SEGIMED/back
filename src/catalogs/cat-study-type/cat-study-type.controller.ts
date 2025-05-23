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
import { CreateCatStudyTypeDto } from './dto/create-cat-study-type.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Catalogs - Study Types')
@Controller('cat-study-type')
export class CatStudyTypeController {
  constructor(private readonly catStudyTypeService: CatStudyTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new study type' })
  @ApiBody({ type: CreateCatStudyTypeDto })
  @ApiResponse({
    status: 201,
    description: 'The study type has been successfully created.',
    type: CreateCatStudyTypeDto, // Assuming response is the created object
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createCatStudyTypeDto: CreateCatStudyTypeDto,
  ): Promise<CatStudyType> {
    return this.catStudyTypeService.create(createCatStudyTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all study types' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved study types.',
    type: [CreateCatStudyTypeDto], // Assuming response is an array of study types
  })
  async findAll(): Promise<CatStudyType[]> {
    return this.catStudyTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a study type by ID' })
  @ApiParam({ name: 'id', description: 'Study type ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved study type.',
    type: CreateCatStudyTypeDto,
  })
  @ApiResponse({ status: 404, description: 'Study type not found.' })
  async findOne(@Param('id') id: number): Promise<CatStudyType> {
    return this.catStudyTypeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a study type by ID' })
  @ApiParam({ name: 'id', description: 'Study type ID', type: Number })
  @ApiBody({ type: CreateCatStudyTypeDto }) // Changed from UpdateCatStudyTypeDto
  @ApiResponse({
    status: 200,
    description: 'The study type has been successfully updated.',
    type: CreateCatStudyTypeDto,
  })
  @ApiResponse({ status: 404, description: 'Study type not found.' })
  async update(
    @Param('id') id: number,
    @Body() catStudyTypeData: CreateCatStudyTypeDto, // Changed from UpdateCatStudyTypeDto
  ): Promise<CatStudyType> {
    return this.catStudyTypeService.update(id, catStudyTypeData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a study type by ID' })
  @ApiParam({ name: 'id', description: 'Study type ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The study type has been successfully deleted.',
    type: CreateCatStudyTypeDto, // Or a success message object
  })
  @ApiResponse({ status: 404, description: 'Study type not found.' })
  async remove(@Param('id') id: number): Promise<CatStudyType> {
    return this.catStudyTypeService.remove(id);
  }
}
