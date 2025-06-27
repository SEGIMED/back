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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Vital Signs')
@Controller('vital-signs')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new vital sign records' })
  @ApiResponse({
    status: 201,
    description: 'Vital signs recorded successfully.',
    type: CreateVitalSignDto, // Assuming this DTO represents the response as well
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: false,
  })
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS) // Should this be CREATE_VITAL_SIGNS or similar?
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
  @ApiOperation({ summary: 'Get all vital signs for a patient' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved vital signs.',
    isArray: true,
    // type: VitalSignRecordDto, // Define a DTO for the response structure if different from CreateVitalSignDto
  })
  @ApiResponse({ status: 400, description: 'Invalid patient ID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: false,
  })
  @ApiParam({
    name: 'patientId',
    type: 'string',
    format: 'uuid',
    description: "Patient's unique identifier",
  })
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
  @ApiOperation({ summary: 'Delete a vital sign record by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Vital sign record deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID supplied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Vital sign record not found.' })
  @ApiBearerAuth('JWT')
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: false,
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid', // Assuming vital sign record ID is a UUID, adjust if not
    description: 'Vital sign record unique identifier',
  })
  @RequirePermission(Permission.EDIT_PATIENT_INFO) // Should this be DELETE_VITAL_SIGNS or similar?
  async remove(@Param('id') id: string, @GetUser() user, @GetTenant() tenant) {
    return this.vitalSignsService.remove(id, user.id, tenant.id);
  }
}
