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
  HttpStatus,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { MedicalPatientDto } from './dto/medical-patient.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('patient')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @ApiOperation({
    summary: 'Create patient',
    description: 'Creates a new patient in the system',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Patient successfully created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid patient data',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.MANAGE_USERS)
  create(@Body() medicalPatientDto: MedicalPatientDto): Promise<object> {
    return this.patientService.create(medicalPatientDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all patients',
    description: 'Returns a list of all patients with pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of patients returned successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.VIEW_PATIENTS_LIST)
  findAll(
    @Query() pagination?: PaginationParams,
    @Query('search') searchQuery?: string,
  ) {
    return this.patientService.findAll(pagination, searchQuery);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: 'Returns a single patient by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient found and returned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update patient',
    description: 'Updates an existing patient by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid patient data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.EDIT_PATIENT_INFO)
  update(
    @Param('id') id: string,
    @Body() medicalPatientDto: MedicalPatientDto,
  ) {
    return this.patientService.update(id, medicalPatientDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete patient',
    description: 'Deletes a patient by ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Insufficient permissions',
  })
  @RequirePermission(Permission.DELETE_PATIENTS)
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
