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
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { MedicalPatientDto } from './dto/medical-patient.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';

@Controller('patient')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @RequirePermission(Permission.MANAGE_USERS)
  create(@Body() medicalPatientDto: MedicalPatientDto): Promise<object> {
    return this.patientService.create(medicalPatientDto);
  }

  @Get()
  @RequirePermission(Permission.VIEW_PATIENTS_LIST)
  findAll(
    @Query() pagination?: PaginationParams,
    @Query('search') searchQuery?: string,
  ) {
    return this.patientService.findAll(pagination, searchQuery);
  }

  @Get(':id')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(Permission.EDIT_PATIENT_INFO)
  update(
    @Param('id') id: string,
    @Body() medicalPatientDto: MedicalPatientDto,
  ) {
    return this.patientService.update(id, medicalPatientDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.DELETE_PATIENTS)
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
