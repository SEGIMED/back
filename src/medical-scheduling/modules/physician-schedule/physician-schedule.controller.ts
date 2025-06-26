import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PhysicianScheduleService } from './physician-schedule.service';
import { CreateExceptionDto, GetSlotsDto, BulkCreateScheduleDto } from './dto';
import { TenantAccessGuard } from '../../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../../auth/guards/permission.guard';
import { RequirePermission } from '../../../auth/decorators/require-permission.decorator';
import { Permission } from '../../../auth/permissions/permission.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Physician Schedule')
@ApiBearerAuth()
@ApiHeader({
  name: 'tenant_id',
  description: 'Tenant ID',
  required: true,
})
@UseGuards(TenantAccessGuard, PermissionGuard)
@Controller('physicians')
export class PhysicianScheduleController {
  constructor(
    private readonly physicianScheduleService: PhysicianScheduleService,
  ) {}

  @Get(':userId/schedule')
  @ApiOperation({ summary: 'Get all schedule entries for a physician' })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved schedule entries.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getSchedule(@Param('userId') userId: string) {
    return this.physicianScheduleService.getSchedule(userId);
  }

  @Get('schedule/:id')
  @ApiOperation({ summary: 'Get a specific schedule entry by ID' })
  @ApiParam({ name: 'id', description: 'Schedule Entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved schedule entry.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule entry not found.' })
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getScheduleEntry(@Param('id') id: string) {
    return this.physicianScheduleService.getScheduleEntry(id);
  }

  @Post(':userId/schedule')
  @ApiOperation({
    summary: 'Create or update multiple schedule entries for a physician',
  })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiBody({ type: BulkCreateScheduleDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created/updated schedule entries.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  upsertSchedules(
    @Param('userId') userId: string,
    @Body() scheduleDto: BulkCreateScheduleDto,
  ) {
    return this.physicianScheduleService.upsertSchedules(userId, scheduleDto);
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: 'Delete a schedule entry by ID' })
  @ApiParam({ name: 'id', description: 'Schedule Entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted schedule entry.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Schedule entry not found.' })
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteSchedule(@Param('id') id: string) {
    return this.physicianScheduleService.deleteSchedule(id);
  }

  @Delete(':userId/schedule')
  @ApiOperation({ summary: 'Delete all schedule entries for a physician' })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted all schedule entries.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteAllSchedules(@Param('userId') userId: string) {
    return this.physicianScheduleService.deleteAllSchedules(userId);
  }

  @Get(':userId/exceptions')
  @ApiOperation({ summary: 'Get all exceptions for a physician' })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved exceptions.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getExceptions(@Param('userId') userId: string) {
    return this.physicianScheduleService.getExceptions(userId);
  }

  @Post(':userId/exceptions')
  @ApiOperation({ summary: 'Create a new exception for a physician' })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiBody({
    type: CreateExceptionDto,
    examples: {
      a: {
        summary: 'Exception with reason',
        value: {
          date: '2024-12-25',
          is_available: false,
          reason: 'Christmas Day',
        },
      },
      b: {
        summary: 'Exception without reason',
        value: { date: '2024-11-01', is_available: false },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created exception.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  createException(
    @Param('userId') userId: string,
    @Body() createExceptionDto: CreateExceptionDto,
  ) {
    return this.physicianScheduleService.createException(
      userId,
      createExceptionDto,
    );
  }

  @Delete('exceptions/:id')
  @ApiOperation({ summary: 'Delete an exception by ID' })
  @ApiParam({ name: 'id', description: 'Exception ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted exception.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Exception not found.' })
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteException(@Param('id') id: string) {
    return this.physicianScheduleService.deleteException(id);
  }

  @Get(':userId/slots')
  @ApiOperation({ summary: 'Get available slots for a physician' })
  @ApiParam({ name: 'userId', description: 'Physician User ID' })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date to check slots (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Optional end date for a range (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved available slots.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  getAvailableSlots(
    @Param('userId') userId: string,
    @Query() getSlotsDto: GetSlotsDto,
  ) {
    console.log('Getting slots for date:', getSlotsDto.date);
    return this.physicianScheduleService.getAvailableSlots(userId, getSlotsDto);
  }
}
