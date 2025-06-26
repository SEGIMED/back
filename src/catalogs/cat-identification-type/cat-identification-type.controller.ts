import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatIdentificationTypeService } from './cat-identification-type.service';
import { CreateCatIdentificationTypeDto } from './dto/create-cat-identification-type.dto';
import { UpdateCatIdentificationTypeDto } from './dto/update-cat-identification-type.dto';
import { CatIdentificationType } from './cat-identification-type.interface';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';

@ApiTags('Catalogs - Identification Types')
@ApiBearerAuth('access-token')
@Controller('cat-identification-type')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class CatIdentificationTypeController {
  constructor(
    private readonly catIdentificationTypeService: CatIdentificationTypeService,
  ) {}

  @Post()
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({
    summary: 'Create a new identification type',
    description:
      'Creates a new identification type in the catalog. Requires MANAGE_CATALOGS permission.',
  })
  @ApiBody({
    type: CreateCatIdentificationTypeDto,
    examples: {
      colombia: {
        summary: 'Colombian ID',
        value: {
          name: 'Cédula de Ciudadanía',
          description:
            'Documento de identificación nacional para ciudadanos colombianos',
          country: 'Colombia',
        },
      },
      passport: {
        summary: 'International Passport',
        value: {
          name: 'Pasaporte',
          description: 'Documento de viaje internacional',
          country: 'Internacional',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The identification type has been successfully created.',
    content: {
      'application/json': {
        example: {
          id: 1,
          name: 'Cédula de Ciudadanía',
          description:
            'Documento de identificación nacional para ciudadanos colombianos',
          country: 'Colombia',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: ['El nombre debe tener entre 1 y 100 caracteres'],
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
    content: {
      'application/json': {
        example: {
          statusCode: 403,
          message: 'No tiene permisos para gestionar catálogos',
          error: 'Forbidden',
        },
      },
    },
  })
  async create(
    @Body() createDto: CreateCatIdentificationTypeDto,
  ): Promise<CatIdentificationType> {
    return this.catIdentificationTypeService.create(createDto);
  }

  @Get()
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({
    summary: 'Get all identification types',
    description:
      'Retrieves all identification types from the catalog. Optionally filter by country.',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description:
      'Filter identification types by country (case-insensitive search)',
    type: String,
    example: 'Colombia',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved identification types.',
    content: {
      'application/json': {
        examples: {
          all: {
            summary: 'All identification types',
            value: [
              {
                id: 1,
                name: 'Cédula de Ciudadanía',
                description:
                  'Documento de identificación nacional para ciudadanos',
                country: 'Colombia',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T10:30:00.000Z',
              },
              {
                id: 2,
                name: 'Pasaporte',
                description: 'Documento de viaje internacional',
                country: 'Colombia',
                created_at: '2024-01-15T11:00:00.000Z',
                updated_at: '2024-01-15T11:00:00.000Z',
              },
            ],
          },
          filtered: {
            summary: 'Filtered by country',
            value: [
              {
                id: 1,
                name: 'Cédula de Ciudadanía',
                description:
                  'Documento de identificación nacional para ciudadanos',
                country: 'Colombia',
                created_at: '2024-01-15T10:30:00.000Z',
                updated_at: '2024-01-15T10:30:00.000Z',
              },
            ],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  async findAll(
    @Query('country') country?: string,
  ): Promise<CatIdentificationType[]> {
    if (country) {
      return this.catIdentificationTypeService.findByCountry(country);
    }
    return this.catIdentificationTypeService.findAll();
  }

  @Get(':id')
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({
    summary: 'Get an identification type by ID',
    description: 'Retrieves a specific identification type by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identification type ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved identification type.',
    content: {
      'application/json': {
        example: {
          id: 1,
          name: 'Cédula de Ciudadanía',
          description: 'Documento de identificación nacional para ciudadanos',
          country: 'Colombia',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ID format.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Identification type not found.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Tipo de identificación no encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CatIdentificationType> {
    return this.catIdentificationTypeService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({
    summary: 'Update an identification type by ID',
    description:
      'Updates an existing identification type. All fields are optional (partial update).',
  })
  @ApiParam({
    name: 'id',
    description: 'Identification type ID to update',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: UpdateCatIdentificationTypeDto,
    examples: {
      partial: {
        summary: 'Partial update - description only',
        value: {
          description: 'Documento nacional de identificación actualizado',
        },
      },
      complete: {
        summary: 'Complete update',
        value: {
          name: 'Cédula de Ciudadanía Actualizada',
          description:
            'Documento de identificación nacional con nueva descripción',
          country: 'Colombia',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The identification type has been successfully updated.',
    content: {
      'application/json': {
        example: {
          id: 1,
          name: 'Cédula de Ciudadanía',
          description: 'Documento nacional de identificación actualizado',
          country: 'Colombia',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T15:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Identification type not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCatIdentificationTypeDto,
  ): Promise<CatIdentificationType> {
    return this.catIdentificationTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({
    summary: 'Delete an identification type by ID',
    description: 'Permanently deletes an identification type from the catalog.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identification type ID to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The identification type has been successfully deleted.',
    content: {
      'application/json': {
        example: {
          id: 1,
          name: 'Cédula de Ciudadanía',
          description: 'Documento de identificación nacional para ciudadanos',
          country: 'Colombia',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Identification type not found.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CatIdentificationType> {
    return this.catIdentificationTypeService.remove(id);
  }
}
