import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateMedicalEventDto } from './dto/create-medical-event.dto';
import { MedicalEventsService } from './medical-events.service';
import { AttendMedicalEventDto } from './dto/attend-medical-event.dto';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { GetTenant } from '../../auth/decorators/get-tenant.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Medical Events')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID del tenant (organización)',
  required: true,
})
@Controller('medical-events')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MedicalEventsController {
  constructor(private readonly medicalEventsService: MedicalEventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical event' })
  @ApiResponse({
    status: 201,
    description: 'The medical event has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createMedicalEvent(
    @Body() createMedicalEventDto: CreateMedicalEventDto,
    @GetTenant() tenant,
  ) {
    return this.medicalEventsService.createMedicalEvent(
      createMedicalEventDto,
      tenant.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of medical events' })
  @ApiQuery({
    name: 'patient_id',
    required: false,
    type: String,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'physician_id',
    required: false,
    type: String,
    description: 'Filter by physician ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Order direction',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved medical events.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMedicalEvents(
    @Query('patient_id') patient_id?: string,
    @Query('physician_id') physician_id?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'asc' | 'desc',
  ) {
    const filters = {
      patient_id,
      physician_id,
      page,
      pageSize,
      orderBy,
      orderDirection,
    };
    return this.medicalEventsService.getMedicalEvents(filters);
  }

  @Post('attend')
  @ApiOperation({ summary: 'Attend a medical event' })
  @ApiResponse({
    status: 201,
    description: 'The medical event has been successfully attended.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @RequirePermission(Permission.ASSIGN_TREATMENTS)
  async attendMedicalEvent(
    @Body() attendMedicalEventDto: AttendMedicalEventDto,
    @GetUser() user,
    @GetTenant() tenant,
  ) {
    return this.medicalEventsService.attendMedicalEvent(
      attendMedicalEventDto,
      user.id,
      tenant.id,
    );
  }
}
