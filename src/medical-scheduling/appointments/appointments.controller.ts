import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';
import { status_type } from '@prisma/client';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { GetTenant } from '../../auth/decorators/get-tenant.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { PaginationParams } from 'src/utils/pagination.helper';
import { GetAppointmentsCalendarDto } from './dto/get-appointments-calendar.dto';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth('access-token')
@Controller('appointments')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create appointment',
    description: 'Creates a new appointment in the system',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid appointment data',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetTenant() tenant: { id: string },
  ) {
    console.log('Creating appointment with dates:');
    console.log('Start:', createAppointmentDto.start);
    console.log('End:', createAppointmentDto.end);

    return this.appointmentsService.createAppointment(
      createAppointmentDto,
      tenant.id,
    );
  }

  @Get('user')
  @ApiOperation({
    summary: 'Get user appointments',
    description: 'Returns appointments for the current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User appointments returned successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async getAppointmentsByUser(
    @GetUser() user,
    @GetTenant() tenant,
    @Query() params: { status?: status_type } & PaginationParams,
  ) {
    return this.appointmentsService.getAppointmentsByUser(user.id, params);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update appointment status',
    description: 'Updates the status of an existing appointment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: status_type; reason?: string },
    @GetTenant() tenant,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.reason,
      tenant,
    );
  }

  @Get('physician-calendar')
  @ApiOperation({
    summary: 'Get physician calendar',
    description: 'Returns calendar data for the current physician',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Physician calendar returned successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  async getPhysicianCalendar(
    @GetUser() user,
    @GetTenant() tenant,
    @Query() params: GetAppointmentsCalendarDto,
  ) {
    return this.appointmentsService.getPhysicianCalendar(
      user.id,
      params.startDate,
      params.endDate,
      params.status,
      tenant.id,
      params.month,
      params.year,
    );
  }

  @Get('physician/:physicianId/calendar')
  @ApiOperation({
    summary: 'Get specific physician calendar',
    description: 'Returns calendar data for a specific physician',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Physician calendar returned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Physician not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  async getSpecificPhysicianCalendar(
    @Param('physicianId') physicianId: string,
    @GetTenant() tenant,
    @Query() params: GetAppointmentsCalendarDto,
  ) {
    return this.appointmentsService.getPhysicianCalendar(
      physicianId,
      params.startDate,
      params.endDate,
      params.status,
      tenant.id,
      params.month,
      params.year,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get appointment statistics',
    description: 'Returns statistics about appointments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics returned successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.VIEW_STATISTICS)
  async getStatistics(@GetTenant() tenant, @Query() params: GetStatisticsDto) {
    // Convertir fechas de string a Date si se proporcionan
    const options = {
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      groupBy: params.groupBy,
      physicianId: params.physicianId,
      patientId: params.patientId,
      specialtyId: params.specialtyId,
      limit: params.limit,
      filter: params.filter,
    };

    return this.appointmentsService.getStatistics(
      params.type,
      tenant.id,
      options,
    );
  }
}
