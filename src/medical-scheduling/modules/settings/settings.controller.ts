import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdatePatientReminderSettingsDto } from '../prescription/dto/medication-tracking.dto';
import { TenantAccessGuard } from '../../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../../auth/guards/permission.guard';
import { RequirePermission } from '../../../auth/decorators/require-permission.decorator';
import { Permission } from '../../../auth/permissions/permission.enum';

@ApiTags('Settings')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'tenant_id',
  description: 'Tenant ID',
  required: true,
})
@Controller('settings')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('patient/:patient_id/reminder-settings')
  @ApiOperation({
    summary: 'Get patient reminder settings',
    description: 'Retrieve medication reminder settings for a specific patient',
  })
  @ApiParam({
    name: 'patient_id',
    type: 'string',
    format: 'uuid',
    description: 'Patient unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient reminder settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', format: 'uuid' },
        medication_reminder_interval_minutes: { type: 'number', default: 30 },
        medication_reminder_max_retries: { type: 'number', default: 3 },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @RequirePermission(Permission.VIEW_PATIENT_SETTINGS)
  async getPatientReminderSettings(@Param('patient_id') patientId: string) {
    return this.settingsService.getPatientReminderSettings(patientId);
  }

  @Patch('patient/:patient_id/reminder-settings')
  @ApiOperation({
    summary: 'Update patient reminder settings',
    description: 'Update medication reminder settings for a specific patient',
  })
  @ApiParam({
    name: 'patient_id',
    type: 'string',
    format: 'uuid',
    description: 'Patient unique identifier',
  })
  @ApiBody({ type: UpdatePatientReminderSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Patient reminder settings updated successfully',
    schema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', format: 'uuid' },
        medication_reminder_interval_minutes: { type: 'number' },
        medication_reminder_max_retries: { type: 'number' },
        updated_at: { type: 'string', format: 'date-time' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @RequirePermission(Permission.UPDATE_PATIENT_SETTINGS)
  async updatePatientReminderSettings(
    @Param('patient_id') patientId: string,
    @Body() updateDto: UpdatePatientReminderSettingsDto,
  ) {
    return this.settingsService.updatePatientReminderSettings(
      patientId,
      updateDto,
    );
  }

  @Get('patient/:patient_id/all')
  @ApiOperation({
    summary: 'Get all patient settings',
    description:
      'Retrieve all settings for a specific patient (reminder, notification, etc.)',
  })
  @ApiParam({
    name: 'patient_id',
    type: 'string',
    format: 'uuid',
    description: 'Patient unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'All patient settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reminder_settings: {
          type: 'object',
          properties: {
            patient_id: { type: 'string', format: 'uuid' },
            medication_reminder_interval_minutes: { type: 'number' },
            medication_reminder_max_retries: { type: 'number' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        // Espacio para futuras configuraciones
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @RequirePermission(Permission.VIEW_PATIENT_SETTINGS)
  async getAllPatientSettings(@Param('patient_id') patientId: string) {
    return this.settingsService.getAllPatientSettings(patientId);
  }

  // Endpoint para que un paciente actualice sus propias configuraciones
  @Patch('my-reminder-settings')
  @ApiOperation({
    summary: 'Update own reminder settings',
    description:
      'Allow authenticated patient to update their own reminder settings',
  })
  @ApiBody({ type: UpdatePatientReminderSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Own reminder settings updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @RequirePermission(Permission.UPDATE_OWN_SETTINGS)
  async updateOwnReminderSettings(
    @Request() req,
    @Body() updateDto: UpdatePatientReminderSettingsDto,
  ) {
    const userId = req.user.id;
    return this.settingsService.updatePatientReminderSettings(
      userId,
      updateDto,
    );
  }

  @Get('my-settings')
  @ApiOperation({
    summary: 'Get own settings',
    description: 'Allow authenticated patient to retrieve their own settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Own settings retrieved successfully',
  })
  @RequirePermission(Permission.VIEW_OWN_SETTINGS)
  async getOwnSettings(@Request() req) {
    const userId = req.user.id;
    return this.settingsService.getAllPatientSettings(userId);
  }
}
