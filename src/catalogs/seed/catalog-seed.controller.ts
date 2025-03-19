import { Controller, Post, UseGuards } from '@nestjs/common';
import { CatalogSeedService } from './catalog-seed.service';
import { SuperAdminGuard } from '../../auth/guards/superadmin.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';

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
  async seedExplorationAreas() {
    await this.catalogSeedService.seedPhysicalExplorationAreas();
    return {
      message:
        'Catálogo de áreas de exploración física inicializado correctamente',
    };
  }
}
