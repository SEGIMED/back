import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatalogSeedService } from './catalog-seed.service';
import { SuperAdminGuard } from '../../auth/guards/superadmin.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';

@ApiTags('Catalogs - Seed')
@ApiBearerAuth('access-token')
@Controller('catalogs/seed')
export class CatalogSeedController {
  constructor(private readonly catalogSeedService: CatalogSeedService) {}

  /**
   * Inicializa todos los catálogos con datos predefinidos
   * Este endpoint solo es accesible para superadmins
   */
  @Post()
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar todos los catálogos',
    description: 'Inicializa todos los catálogos con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Todos los catálogos han sido inicializados correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Todos los catálogos han sido inicializados correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedAllCatalogs() {
    await this.catalogSeedService.seedAllCatalogs();
    return {
      message: 'Todos los catálogos han sido inicializados correctamente',
    };
  }
  /**
   * Inicializa solo el catálogo de tipos de estudio
   */
  @Post('study-types')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de tipos de estudio',
    description:
      'Inicializa solo el catálogo de tipos de estudio con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de tipos de estudio inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo de tipos de estudio inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedStudyTypes() {
    await this.catalogSeedService.seedCatStudyTypes();
    return {
      message: 'Catálogo de tipos de estudio inicializado correctamente',
    };
  }

  /**
   * Inicializa solo el catálogo CIE-10
   */
  @Post('cie-diez')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo CIE-10',
    description: 'Inicializa solo el catálogo CIE-10 con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo CIE-10 inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo CIE-10 inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedCieDiez() {
    await this.catalogSeedService.seedCatCieDiez();
    return { message: 'Catálogo CIE-10 inicializado correctamente' };
  }
  /**
   * Inicializa solo el subcatálogo CIE-10
   */
  @Post('subcat-cie-diez')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar subcatálogo CIE-10',
    description: 'Inicializa solo el subcatálogo CIE-10 con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcatálogo CIE-10 inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Subcatálogo CIE-10 inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedSubcatCieDiez() {
    await this.catalogSeedService.seedSubcatCieDiez();
    return { message: 'Subcatálogo CIE-10 inicializado correctamente' };
  }

  /**
   * Inicializa solo el catálogo de signos vitales
   */
  @Post('vital-signs')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de signos vitales',
    description:
      'Inicializa solo el catálogo de signos vitales con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de signos vitales inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo de signos vitales inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedVitalSigns() {
    await this.catalogSeedService.seedCatVitalSigns();
    return { message: 'Catálogo de signos vitales inicializado correctamente' };
  }
  /**
   * Inicializa solo el catálogo de unidades de medida
   */
  @Post('measure-units')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de unidades de medida',
    description:
      'Inicializa solo el catálogo de unidades de medida con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de unidades de medida inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo de unidades de medida inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedMeasureUnits() {
    await this.catalogSeedService.seedCatMeasureUnits();
    return {
      message: 'Catálogo de unidades de medida inicializado correctamente',
    };
  }

  /**
   * Inicializa solo el catálogo de especialidades
   */
  @Post('specialties')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de especialidades',
    description:
      'Inicializa solo el catálogo de especialidades con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de especialidades inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo de especialidades inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedSpecialties() {
    await this.catalogSeedService.seedSpecialties();
    return { message: 'Catálogo de especialidades inicializado correctamente' };
  }
  /**
   * Inicializa solo el catálogo de subsistemas físicos
   */
  @Post('physical-subsystems')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de subsistemas físicos',
    description:
      'Inicializa solo el catálogo de subsistemas físicos con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de subsistemas físicos inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Catálogo de subsistemas físicos inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedPhysicalSubsystems() {
    await this.catalogSeedService.seedPhysicalSubsystems();
    return {
      message: 'Catálogo de subsistemas físicos inicializado correctamente',
    };
  }

  /**
   * Inicializa solo el catálogo de áreas de exploración física
   */
  @Post('exploration-areas')
  @UseGuards(SuperAdminGuard)
  @RequirePermission(Permission.CONFIGURE_SYSTEM_SETTINGS)
  @ApiOperation({
    summary: 'Inicializar catálogo de áreas de exploración física',
    description:
      'Inicializa solo el catálogo de áreas de exploración física con datos predefinidos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Catálogo de áreas de exploración física inicializado correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Catálogo de áreas de exploración física inicializado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Requiere permisos de SuperAdmin',
  })
  async seedExplorationAreas() {
    await this.catalogSeedService.seedPhysicalExplorationAreas();
    return {
      message:
        'Catálogo de áreas de exploración física inicializado correctamente',
    };
  }
}
