import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { CreateVitalSignDto } from './dto/create-vital-sign.dto';
import { FindVitalSignsByPatientDto } from './dto/find-vital-signs.dto';
import { RequirePermission } from '../../../auth/decorators/require-permission.decorator';
import { Permission } from '../../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../../auth/guards/tenant-access.guard';
import { GetTenant } from '../../../auth/decorators/get-tenant.decorator';
import { GetUser } from '../../../auth/decorators/get-user.decorator';

@Controller('vital-signs')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  async create(
    @Body() createVitalSignDto: CreateVitalSignDto,
    @GetTenant() tenant,
  ) {
    // Asignar el tenant_id desde el request si no está presente en el DTO
    if (!createVitalSignDto.tenant_id) {
      createVitalSignDto.tenant_id = tenant.id;
    } else if (createVitalSignDto.tenant_id !== tenant.id) {
      throw new BadRequestException(
        'El tenant_id no coincide con el tenant del usuario',
      );
    }

    return this.vitalSignsService.create(createVitalSignDto);
  }

  @Get('patient/:patientId')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  async findAllByPatient(
    @Param('patientId') patientId: string,
    @GetTenant() tenant,
  ) {
    const findDto: FindVitalSignsByPatientDto = {
      patient_id: patientId,
      tenant_id: tenant.id,
    };

    return this.vitalSignsService.findAllByPatient(findDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.EDIT_PATIENT_INFO)
  async remove(@Param('id') id: string, @GetUser() user, @GetTenant() tenant) {
    return this.vitalSignsService.remove(id, user.id, tenant.id);
  }
}
