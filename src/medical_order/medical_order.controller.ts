import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { CreateMedicalOrderDto } from './dto/create-medical_order.dto';
import { UpdateMedicalOrderDto } from './dto/update-medical_order.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import { GetTenant } from 'src/auth/decorators/get-tenant.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { TenantAccessGuard } from 'src/auth/guards/tenant-access.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { Permission } from 'src/auth/permissions/permission.enum';
import { MedicalOrderPaginatedResponseDto } from './dto/medical-order-response.dto';

@Controller('medical-order')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MedicalOrderController {
  constructor(private readonly medicalOrderService: MedicalOrderService) {}

  @Post()
  @RequirePermission(Permission.CREATE_MEDICAL_ORDERS)
  create(
    @Body() createMedicalOrderDto: CreateMedicalOrderDto,
    @Query('type') orderType: string,
    @GetTenant() tenant,
    @GetUser() user,
  ) {
    return this.medicalOrderService.create(
      createMedicalOrderDto,
      orderType,
      tenant.id,
      user.id,
    );
  }

  @Get()
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findAll(
    @Query() paginationParams: PaginationParams,
    @GetTenant() tenant,
    @Query('type') orderType?: string,
    @Query('patient_id') patientId?: string,
  ) {
    return this.medicalOrderService.findAll(
      paginationParams,
      tenant.id,
      orderType,
      patientId,
    );
  }

  @Get('physician')
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findAllForPhysician(
    @Query() paginationParams: PaginationParams,
    @GetTenant() tenant,
    @GetUser() user,
    @Query('patient_id') patientId?: string,
    @Query('type') orderType?: string,
  ): Promise<MedicalOrderPaginatedResponseDto> {
    return this.medicalOrderService.findAllForPhysician(
      paginationParams,
      tenant.id,
      user.id,
      patientId,
      orderType,
    );
  }

  @Get('patient')
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findAllForPatient(
    @Query() paginationParams: PaginationParams,
    @GetUser() user,
    @Query('physician_id') physicianId?: string,
    @Query('type') orderType?: string,
    @Query('tenant_id') tenantId?: string,
    @Req() req?: any,
  ): Promise<MedicalOrderPaginatedResponseDto> {
    // Get the tenants array from the request
    const userTenants = req?.userTenants || [];

    return this.medicalOrderService.findAllForPatient(
      paginationParams,
      user.id,
      physicianId,
      orderType,
      tenantId,
      userTenants,
    );
  }

  @Get(':id')
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findOne(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @RequirePermission(Permission.UPDATE_MEDICAL_ORDERS)
  update(
    @Param('id') id: string,
    @Body() updateMedicalOrderDto: UpdateMedicalOrderDto,
    @GetTenant() tenant,
  ) {
    return this.medicalOrderService.update(
      id,
      updateMedicalOrderDto,
      tenant.id,
    );
  }

  @Delete(':id')
  @RequirePermission(Permission.DELETE_MEDICAL_ORDERS)
  remove(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.remove(id, tenant.id);
  }
}
