import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CatVitalSignsService } from './cat-vital-signs.service';
import { CreateCatVitalSignsDto } from './dto/create-cat-vital-signs.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { SuperAdminGuard } from '../../auth/guards/superadmin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Catalogs - Vital Signs')
@ApiSecurity('access-token')
@ApiHeader({
  name: 'tenant_id',
  description: 'ID del tenant',
  required: true,
})
@Controller('cat-vital-signs')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class CatVitalSignsController {
  constructor(private readonly catVitalSignsService: CatVitalSignsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({ summary: 'Create a new vital sign' })
  @ApiBody({ type: CreateCatVitalSignsDto })
  @ApiResponse({
    status: 201,
    description: 'The vital sign has been successfully created',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin permissions',
  })
  async create(@Body() createCatVitalSignsDto: CreateCatVitalSignsDto) {
    return this.catVitalSignsService.create(createCatVitalSignsDto);
  }

  @Get()
  @RequirePermission(Permission.VIEW_DOCTORS_LIST)
  @ApiOperation({
    summary: 'Get all vital signs, optionally filtered by specialty IDs',
  })
  @ApiQuery({
    name: 'specialtyIds',
    required: false,
    description: 'Comma-separated list of specialty IDs',
    example: '1,2,3',
  })
  @ApiResponse({
    status: 200,
    description: 'List of vital signs',
    type: [Object],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid specialty ID format',
  })
  async findAll(@Query('specialtyIds') specialtyIdsString?: string) {
    try {
      let specialtyIds: number[] | undefined;

      if (specialtyIdsString) {
        specialtyIds = specialtyIdsString.split(',').map((id) => {
          const parsedId = parseInt(id.trim(), 10);
          if (isNaN(parsedId)) {
            throw new BadRequestException(`ID de especialidad inválido: ${id}`);
          }
          return parsedId;
        });
      }

      return this.catVitalSignsService.findAll(specialtyIds);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener los signos vitales');
    }
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({ summary: 'Delete a vital sign' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the vital sign to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The vital sign has been successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid ID format' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires SuperAdmin permissions',
  })
  async remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.catVitalSignsService.remove(parsedId);
  }
}
