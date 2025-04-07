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

@UseGuards(TenantAccessGuard, PermissionGuard)
@Controller('physicians')
export class PhysicianScheduleController {
  constructor(
    private readonly physicianScheduleService: PhysicianScheduleService,
  ) {}

  // Get all schedule entries for a physician
  @Get(':userId/schedule')
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getSchedule(@Param('userId') userId: string) {
    return this.physicianScheduleService.getSchedule(userId);
  }

  // Get a specific schedule entry
  @Get('schedule/:id')
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getScheduleEntry(@Param('id') id: string) {
    return this.physicianScheduleService.getScheduleEntry(id);
  }

  // Create or update multiple schedule entries at once
  @Post(':userId/schedule')
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  upsertSchedules(
    @Param('userId') userId: string,
    @Body() scheduleDto: BulkCreateScheduleDto,
  ) {
    return this.physicianScheduleService.upsertSchedules(userId, scheduleDto);
  }

  // Delete a schedule entry
  @Delete('schedule/:id')
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteSchedule(@Param('id') id: string) {
    return this.physicianScheduleService.deleteSchedule(id);
  }

  // Delete all schedule entries for a physician
  @Delete(':userId/schedule')
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteAllSchedules(@Param('userId') userId: string) {
    return this.physicianScheduleService.deleteAllSchedules(userId);
  }

  // Get all exceptions for a physician
  @Get(':userId/exceptions')
  @RequirePermission(Permission.VIEW_DOCTOR_DETAILS)
  getExceptions(@Param('userId') userId: string) {
    return this.physicianScheduleService.getExceptions(userId);
  }

  // Create a new exception
  @Post(':userId/exceptions')
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

  // Delete an exception
  @Delete('exceptions/:id')
  @RequirePermission(Permission.BLOCK_SCHEDULE)
  deleteException(@Param('id') id: string) {
    return this.physicianScheduleService.deleteException(id);
  }

  // Get available slots for a physician on a given date
  @Get(':userId/slots')
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  getAvailableSlots(
    @Param('userId') userId: string,
    @Query() getSlotsDto: GetSlotsDto,
  ) {
    console.log('Getting slots for date:', getSlotsDto.date);
    return this.physicianScheduleService.getAvailableSlots(userId, getSlotsDto);
  }
}
