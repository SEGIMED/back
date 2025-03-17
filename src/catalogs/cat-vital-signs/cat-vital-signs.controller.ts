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

@Controller('cat-vital-signs')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class CatVitalSignsController {
  constructor(private readonly catVitalSignsService: CatVitalSignsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.MANAGE_CATALOGS)
  async create(@Body() createCatVitalSignsDto: CreateCatVitalSignsDto) {
    return this.catVitalSignsService.create(createCatVitalSignsDto);
  }

  @Get()
  @RequirePermission(Permission.VIEW_DOCTORS_LIST)
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
  async remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('ID inválido');
    }

    return this.catVitalSignsService.remove(parsedId);
  }
}
