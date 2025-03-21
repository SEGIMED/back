import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
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

@Controller('appointments')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetTenant() tenant,
  ) {
    if (!createAppointmentDto.tenant_id) {
      createAppointmentDto.tenant_id = tenant.id;
    } else if (createAppointmentDto.tenant_id !== tenant.id) {
      throw new BadRequestException(
        'El tenant_id no coincide con el tenant del usuario',
      );
    }

    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get('user')
  @RequirePermission(Permission.SCHEDULE_APPOINTMENTS)
  async getAppointmentsByUser(
    @GetUser() user,
    @GetTenant() tenant,
    @Query() params: { status?: status_type } & PaginationParams,
  ) {
    return this.appointmentsService.getAppointmentsByUser(user.id, params);
  }

  @Patch(':id/status')
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
}
