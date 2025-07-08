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
import { PaginatedAppointmentsResponseDto } from './dto/paginated-appointments-response.dto';
import { AppointmentWithRelationsDto } from './dto/appointment-with-relations.dto';
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
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth('JWT')
@Controller('appointments')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear cita',
    description: 'Crea una nueva cita en el sistema',
  })
  @ApiBody({
    description: 'Datos para crear la cita',
    type: CreateAppointmentDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cita creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de cita inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Permisos insuficientes',
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
    summary: 'Obtener citas del usuario',
    description: 'Devuelve las citas del usuario actual',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filtrar por estado de la cita',
    required: false,
    enum: ['atendida', 'cancelada', 'pendiente'],
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página para paginación',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de elementos por página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'specialty_id',
    description: 'ID de la especialidad médica para filtrar citas',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'orderBy',
    description: 'Campo por el cual ordenar los resultados',
    required: false,
    enum: [
      'start',
      'end',
      'created_at',
      'updated_at',
      'status',
      'consultation_reason',
    ],
    example: 'start',
  })
  @ApiQuery({
    name: 'orderDirection',
    description: 'Dirección del ordenamiento',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Citas del usuario devueltas exitosamente',
    type: PaginatedAppointmentsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Permisos insuficientes',
  })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async getAppointmentsByUser(
    @GetUser() user,
    @GetTenant() tenant,
    @Query()
    params: { status?: status_type; specialty_id?: number } & PaginationParams,
  ) {
    return this.appointmentsService.getAppointmentsByUser(user.id, params);
  }

  @Get(':id')
  @UseGuards(TenantAccessGuard)
  @ApiOperation({
    summary: 'Obtener cita por ID',
    description: 'Devuelve los detalles completos de una cita específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cita',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cita encontrada exitosamente',
    type: AppointmentWithRelationsDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada o sin permisos para acceder',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Permisos insuficientes',
  })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async getAppointmentById(
    @Param('id') id: string,
    @GetUser() user,
    @GetTenant() tenant,
  ) {
    return this.appointmentsService.getAppointmentById(id, user.id, tenant.id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado de cita',
    description: 'Actualiza el estado de una cita existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la cita a actualizar',
    type: String,
  })
  @ApiBody({
    description: 'Datos para actualizar el estado',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['atendida', 'cancelada', 'pendiente'],
          description: 'Nuevo estado para la cita',
        },
        reason: {
          type: 'string',
          description: 'Razón para el cambio de estado (opcional)',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado de cita actualizado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de estado inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cita no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Permisos insuficientes',
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
    summary: 'Obtener calendario del médico',
    description: 'Devuelve los datos del calendario para el médico actual',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha de inicio para la vista del calendario (formato ISO)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha de fin para la vista del calendario (formato ISO)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filtrar por estado de la cita',
    required: false,
    enum: ['atendida', 'cancelada', 'pendiente'],
  })
  @ApiQuery({
    name: 'month',
    description: 'Mes para el calendario (1-12)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    description: 'Año para el calendario',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendario del médico devuelto exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Prohibido - Permisos insuficientes',
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
      params.specialty_id,
    );
  }

  @Get('physician/:physicianId/calendar')
  @ApiOperation({
    summary: 'Get specific physician calendar',
    description: 'Returns calendar data for a specific physician',
  })
  @ApiParam({
    name: 'physicianId',
    description: 'ID of the physician',
    type: String,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for calendar view (ISO format)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for calendar view (ISO format)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by appointment status',
    required: false,
    enum: ['atendida', 'cancelada', 'pendiente'],
  })
  @ApiQuery({
    name: 'month',
    description: 'Month for calendar (1-12)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    description: 'Year for calendar',
    required: false,
    type: Number,
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
      params.specialty_id,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get appointment statistics',
    description: 'Returns statistics about appointments',
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of statistics to retrieve',
    required: true,
    enum: [
      'appointments_by_status',
      'appointments_by_day',
      'appointments_by_month',
      'appointments_by_physician',
      'diagnoses_distribution',
      'consultations_count',
      'patient_demographics',
      'attendance_rate',
      'physician_workload',
      'scheduling_trends',
    ],
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for statistics (ISO format)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for statistics (ISO format)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'groupBy',
    description: 'How to group statistics',
    required: false,
    enum: [
      'day',
      'week',
      'month',
      'quarter',
      'year',
      'physician',
      'patient',
      'status',
      'specialty',
      'diagnosis',
    ],
  })
  @ApiQuery({
    name: 'physicianId',
    description: 'Filter by physician ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'patientId',
    description: 'Filter by patient ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'specialtyId',
    description: 'Filter by specialty ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit number of results',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'filter',
    description: 'Additional filter criteria',
    required: false,
    type: String,
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
