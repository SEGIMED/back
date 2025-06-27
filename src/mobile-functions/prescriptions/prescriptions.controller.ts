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
import {
  CreateMedicationDoseLogDto,
  SkipMedicationDoseDto,
  AdjustDoseTimeDto,
} from './dto/medication-dose-log.dto';
import { CancelTrackingDto } from './dto/cancel-tracking.dto';
import { UpdatePrescriptionScheduleDto } from './dto/update-prescription-schedule.dto';
import { MedicationAdherenceStatsDto } from '../../medical-scheduling/modules/prescription/dto/medication-tracking-response.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Mobile Prescriptions')
@ApiBearerAuth('JWT')
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
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.getPrescriptionsForTracking(
      patientId,
      query.date,
      userTenants,
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
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.activateTracking(
      prescriptionId,
      patientId,
      activateDto,
      userTenants,
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
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.toggleReminder(
      prescriptionId,
      patientId,
      toggleDto,
      userTenants,
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
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.createMedicationDoseLog(
      patientId,
      createDto,
      userTenants,
    );
  }

  @Patch('medication-dose-log/:log_id/skip')
  @ApiOperation({ summary: 'Mark dose as skipped by user' })
  @ApiParam({
    name: 'log_id',
    description: 'Medication dose log ID to mark as skipped',
  })
  @ApiBody({ type: SkipMedicationDoseDto })
  @ApiResponse({
    status: 200,
    description: 'Dose marked as skipped successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Dose log not found for this patient',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async skipMedicationDose(
    @Request() req,
    @Param('log_id') logId: string,
    @Body() skipDto: SkipMedicationDoseDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.skipMedicationDose(
      patientId,
      logId,
      skipDto,
    );
  }
  @Patch('medication-dose-log/:log_id/adjust-time')
  @ApiOperation({ summary: 'Adjust actual taken time for a dose' })
  @ApiParam({
    name: 'log_id',
    description: 'Medication dose log ID to adjust time for',
  })
  @ApiBody({ type: AdjustDoseTimeDto })
  @ApiResponse({
    status: 200,
    description: 'Dose time adjusted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Taken dose log not found for this patient',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async adjustDoseTime(
    @Request() req,
    @Param('log_id') logId: string,
    @Body() adjustDto: AdjustDoseTimeDto,
  ) {
    const patientId = req.user.id;
    return this.prescriptionsService.adjustDoseTime(
      patientId,
      logId,
      adjustDto,
    );
  }

  @Patch(':prescription_id/cancel-tracking')
  @ApiOperation({ summary: 'Cancel tracking for a prescription' })
  @ApiParam({
    name: 'prescription_id',
    description: 'Prescription ID to cancel tracking for',
  })
  @ApiBody({ type: CancelTrackingDto })
  @ApiResponse({
    status: 200,
    description: 'Tracking cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or tracking not active',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async cancelTracking(
    @Request() req,
    @Param('prescription_id') prescriptionId: string,
    @Body() cancelDto: CancelTrackingDto,
  ) {
    const patientId = req.user.id;
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.cancelTracking(
      prescriptionId,
      patientId,
      cancelDto,
      userTenants,
    );
  }

  @Patch(':prescription_id/schedule')
  @ApiOperation({ summary: 'Update prescription schedule' })
  @ApiParam({
    name: 'prescription_id',
    description: 'Prescription ID to update schedule for',
  })
  @ApiBody({ type: UpdatePrescriptionScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Prescription schedule updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or tracking not active',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async updateSchedule(
    @Request() req,
    @Param('prescription_id') prescriptionId: string,
    @Body() updateDto: UpdatePrescriptionScheduleDto,
  ) {
    const patientId = req.user.id;
    const userTenants = req.userTenants || [];
    return this.prescriptionsService.updateSchedule(
      prescriptionId,
      patientId,
      updateDto,
      userTenants,
    );
  }

  @Get('medication-skip-reasons')
  @ApiOperation({ summary: 'Get medication skip reasons catalog' })
  @ApiResponse({
    status: 200,
    description: 'Returns medication skip reasons catalog',
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async getMedicationSkipReasons() {
    return this.prescriptionsService.getMedicationSkipReasons();
  }

  @Get('medication-adherence')
  @ApiOperation({ summary: 'Get medication adherence statistics' })
  @ApiQuery({
    name: 'period_start',
    required: false,
    description: 'Start date for adherence calculation (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'period_end',
    required: false,
    description: 'End date for adherence calculation (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'prescription_id',
    required: false,
    description: 'Specific prescription ID to calculate adherence for',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns medication adherence statistics',
    type: MedicationAdherenceStatsDto,
  })
  @RequirePermission(Permission.VIEW_OWN_PRESCRIPTIONS)
  async getMedicationAdherence(
    @Request() req,
    @Query('period_start') periodStart?: string,
    @Query('period_end') periodEnd?: string,
    @Query('prescription_id') prescriptionId?: string,
  ) {
    const patientId = req.user.id;

    const periodStartDate = periodStart ? new Date(periodStart) : undefined;
    const periodEndDate = periodEnd ? new Date(periodEnd) : undefined;

    return this.prescriptionsService.calculateMedicationAdherence(
      patientId,
      prescriptionId,
      periodStartDate,
      periodEndDate,
    );
  }
}
