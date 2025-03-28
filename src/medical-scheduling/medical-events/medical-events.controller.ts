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

@Controller('medical-events')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class MedicalEventsController {
  constructor(private readonly medicalEventsService: MedicalEventsService) {}

  @Post()
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
