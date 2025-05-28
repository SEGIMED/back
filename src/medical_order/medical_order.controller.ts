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
  Headers,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { MedicalOrderPaginatedResponseDto } from './dto/medical-order-response.dto';

@ApiTags('Medical Order')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'tenant-id',
  description: 'ID del tenant al que pertenecen las órdenes médicas',
  required: true,
})
@Controller('medical-order')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MedicalOrderController {
  constructor(private readonly medicalOrderService: MedicalOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical order' })
  @ApiQuery({
    name: 'type',
    description: 'Type of medical order',
    required: true,
  })
  @ApiBody({ type: CreateMedicalOrderDto })
  @ApiResponse({
    status: 201,
    description: 'The medical order has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
  @ApiOperation({ summary: 'Retrieve all medical orders with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by order type',
  })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    description: 'Filter by patient ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved medical orders.',
    type: MedicalOrderPaginatedResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
  @ApiOperation({
    summary: 'Retrieve all medical orders for a physician with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by order type',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved medical orders for physician.',
    type: MedicalOrderPaginatedResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
  @ApiOperation({
    summary: 'Retrieve all medical orders for a patient with pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'physician_id',
    required: false,
    description: 'Filter by physician ID',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by order type',
  })
  @ApiQuery({
    name: 'tenant_id',
    required: false,
    description: 'Filter by tenant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved medical orders for patient.',
    type: MedicalOrderPaginatedResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
  @ApiOperation({ summary: 'Retrieve a specific medical order by ID' })
  @ApiParam({ name: 'id', description: 'ID of the medical order' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved medical order.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Medical order not found.' })
  @RequirePermission(Permission.VIEW_MEDICAL_ORDERS)
  findOne(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific medical order by ID' })
  @ApiParam({ name: 'id', description: 'ID of the medical order to update' })
  @ApiBody({ type: UpdateMedicalOrderDto })
  @ApiResponse({
    status: 200,
    description: 'The medical order has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Medical order not found.' })
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
  @ApiOperation({ summary: 'Delete a specific medical order by ID' })
  @ApiParam({ name: 'id', description: 'ID of the medical order to delete' })
  @ApiResponse({
    status: 200,
    description: 'The medical order has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Medical order not found.' })
  @RequirePermission(Permission.DELETE_MEDICAL_ORDERS)
  remove(@Param('id') id: string, @GetTenant() tenant) {
    return this.medicalOrderService.remove(id, tenant.id);
  }
}
