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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatMeasureUnitService } from './cat-measure-unit.service';
import { CreateCatMeasureUnitDto } from './dto/create-cat-measure-unit.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { SuperAdminGuard } from '../../auth/guards/superadmin.guard';

@ApiTags('Catalogs - Measure Units')
@ApiBearerAuth('JWT')
@Controller('cat-measure-unit')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class CatMeasureUnitController {
  constructor(private readonly catMeasureUnitService: CatMeasureUnitService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({ summary: 'Create a new measure unit' })
  @ApiBody({ type: CreateCatMeasureUnitDto })
  @ApiResponse({
    status: 201,
    description: 'The measure unit has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createCatMeasureUnitDto: CreateCatMeasureUnitDto) {
    return this.catMeasureUnitService.create(createCatMeasureUnitDto);
  }

  @Get()
  @RequirePermission(Permission.VIEW_DOCTORS_LIST) // Assuming this is a placeholder, adjust if a more specific permission exists
  @ApiOperation({
    summary: 'Get all measure units, optionally filtered by vital sign ID',
  })
  @ApiQuery({
    name: 'vitalSignId',
    required: false,
    type: Number,
    description: 'ID of the vital sign to filter measure units',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved measure units.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query('vitalSignId') vitalSignIdString?: string) {
    try {
      let vitalSignId: number | undefined;

      if (vitalSignIdString) {
        vitalSignId = parseInt(vitalSignIdString, 10);
        if (isNaN(vitalSignId)) {
          throw new BadRequestException(
            `ID de signo vital inválido: ${vitalSignIdString}`,
          );
        }
      }

      return this.catMeasureUnitService.findAll(vitalSignId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener las unidades de medida');
    }
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  @ApiOperation({ summary: 'Delete a measure unit by ID' })
  @ApiParam({ name: 'id', description: 'Measure unit ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The measure unit has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Measure unit not found.' })
  async remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.catMeasureUnitService.remove(parsedId);
  }
}
