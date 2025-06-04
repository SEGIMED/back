import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
// Controller for handling prescription endpoints
import { PrescriptionsService } from './prescriptions.service';
import { CreateSelfAssignedPrescriptionDto } from './dto/create-self-assigned-prescription.dto';
import {
  ActivateTrackingDto,
  ToggleReminderDto,
  TrackingQueryDto,
} from './dto/tracking.dto';
import { CreateMedicationDoseLogDto } from './dto/medication-dose-log.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
  ApiHeader,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Mobile Prescriptions')
@ApiSecurity('bearer')
@ApiHeader({
  name: 'tenant_id',
  description: 'Tenant ID',
  required: true,
})
@Controller('mobile/prescriptions')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}
  @Post('self-assigned')
  @ApiOperation({ summary: 'Patient adds their own medication' })
  @ApiBody({ type: CreateSelfAssignedPrescriptionDto })
  @ApiResponse({
    status: 201,
    description: 'The prescription has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async createSelfAssigned(
    @Request() req,
    @Body() createDto: CreateSelfAssignedPrescriptionDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.createSelfAssignedPrescription(
      patientId,
      createDto,
    );
  }
  @Get('tracking')
  @ApiOperation({ summary: 'Get prescriptions for tracking' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns prescriptions with tracking status',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async getPrescriptionsForTracking(
    @Request() req,
    @Query() query: TrackingQueryDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.getPrescriptionsForTracking(
      patientId,
      query.date,
    );
  }
  @Patch(':prescription_id/activate-tracking')
  @ApiOperation({ summary: 'Activate tracking for a prescription' })
  @ApiParam({
    name: 'prescription_id',
    description: 'Prescription ID to activate tracking for',
  })
  @ApiBody({ type: ActivateTrackingDto })
  @ApiResponse({
    status: 200,
    description: 'Tracking activated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or tracking already active',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async activateTracking(
    @Request() req,
    @Param('prescription_id') prescriptionId: string,
    @Body() activateDto: ActivateTrackingDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.activateTracking(
      prescriptionId,
      patientId,
      activateDto,
    );
  }
  @Patch(':prescription_id/toggle-reminder')
  @ApiOperation({ summary: 'Toggle reminders for a prescription' })
  @ApiParam({
    name: 'prescription_id',
    description: 'Prescription ID to toggle reminder for',
  })
  @ApiBody({ type: ToggleReminderDto })
  @ApiResponse({
    status: 200,
    description: 'Reminder setting updated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Cannot toggle reminders for non-active tracking prescriptions',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async toggleReminder(
    @Request() req,
    @Param('prescription_id') prescriptionId: string,
    @Body() toggleDto: ToggleReminderDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.toggleReminder(
      prescriptionId,
      patientId,
      toggleDto,
    );
  }

  @Post('medication-dose-log')
  @ApiOperation({ summary: 'Create new medication dose record' })
  @ApiBody({ type: CreateMedicationDoseLogDto })
  @ApiResponse({
    status: 201,
    description: 'Medication dose log created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Active prescription not found for this patient',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async createMedicationDoseLog(
    @Request() req,
    @Body() createDto: CreateMedicationDoseLogDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.createMedicationDoseLog(
      patientId,
      createDto,
    );
  }
}
