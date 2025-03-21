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
import { CatMeasureUnitService } from './cat-measure-unit.service';
import { CreateCatMeasureUnitDto } from './dto/create-cat-measure-unit.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { SuperAdminGuard } from '../../auth/guards/superadmin.guard';

@Controller('cat-measure-unit')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class CatMeasureUnitController {
  constructor(private readonly catMeasureUnitService: CatMeasureUnitService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  async create(@Body() createCatMeasureUnitDto: CreateCatMeasureUnitDto) {
    return this.catMeasureUnitService.create(createCatMeasureUnitDto);
  }

  @Get()
  @RequirePermission(Permission.VIEW_DOCTORS_LIST)
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
  async remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.catMeasureUnitService.remove(parsedId);
  }
}
