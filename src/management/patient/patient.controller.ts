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
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { MedicalPatientDto } from './dto/medical-patient.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import {
  PatientProfileMobileResponseDto,
  UpdatePatientProfileMobileResponseDto,
} from './dto/mobile-patient-profile-response.dto';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { Permission } from '../../auth/permissions/permission.enum';
import { TenantAccessGuard } from '../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth('JWT')
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records per page',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query to filter patients',
    type: String,
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
  @ApiParam({
    name: 'id',
    description: 'ID of the patient to retrieve',
    type: String,
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
  @ApiParam({
    name: 'id',
    description: 'ID of the patient to update',
    type: String,
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
  @ApiParam({
    name: 'id',
    description: 'ID of the patient to delete',
    type: String,
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
  // Mobile endpoints para pacientes
  @Get('my-profile')
  @ApiTags('Mobile - Patient Profile')
  @RequirePermission(Permission.VIEW_OWN_SETTINGS)
  @ApiOperation({
    summary: 'Get patient own profile with multitenant support',
    description:
      'Gets the complete profile for the authenticated patient across all their associated organizations. Patient ID is extracted from JWT token automatically. This endpoint is designed for mobile applications.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile retrieved successfully',
    type: PatientProfileMobileResponseDto,
    content: {
      'application/json': {
        example: {
          id: 'uuid-patient',
          name: 'Juan',
          last_name: 'Pérez',
          image: 'https://example.com/patient.jpg',
          age: 35,
          birth_date: '1989-01-15T00:00:00Z',
          direction: 'Av. Principal 123, Col. Centro',
          city: 'Ciudad de México',
          province: 'CDMX',
          country: 'México',
          postal_code: '12345',
          phone: '+1234567890',
          email: 'juan.perez@example.com',
          notes: 'Notas del paciente',
          vital_signs: [
            {
              id: 'uuid-vital-sign',
              vital_sign_category: 'Presión Arterial',
              measure: 120,
              vital_sign_measure_unit: 'mmHg',
            },
          ],
          files: [
            {
              id: 'uuid-file',
              name: 'Radiografía de Tórax',
              url: 'https://example.com/file.pdf',
            },
          ],
          evaluation: {
            id: 'uuid-evaluation',
            details: 'Evaluación médica reciente',
            date: '2024-01-10T15:30:00Z',
          },
          background: {
            id: 'uuid-background',
            details: 'Antecedentes médicos completos',
            date: '2024-01-01T00:00:00Z',
          },
          current_medication: [
            {
              id: 'uuid-medication',
              name: 'Aspirina',
              dosage: '100 mg',
              instructions: 'Cada 8 horas, durante 7 días',
              active: true,
            },
          ],
          future_medical_events: [
            {
              id: 'uuid-appointment',
              date: '2024-01-20T10:00:00Z',
              time: '10:00',
              doctor: 'Dr. García',
              reason: 'Control general',
              status: 'pendiente',
            },
          ],
          past_medical_events: [
            {
              id: 'uuid-past-appointment',
              date: '2024-01-05T14:00:00Z',
              time: '14:00',
              doctor: 'Dr. López',
              reason: 'Consulta inicial',
              status: 'atendida',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - User is not a patient or request is invalid',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'User is not a patient',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          notAuthenticated: {
            summary: 'User not authenticated',
            value: {
              statusCode: 400,
              message: 'Usuario no autenticado',
              error: 'Bad Request',
            },
          },
          noOrganizations: {
            summary: 'No organizations associated',
            value: {
              statusCode: 404,
              message: 'No se encontraron organizaciones asociadas al paciente',
              error: 'Not Found',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - Insufficient permissions to view own profile settings',
  })
  async getMyProfile(@Request() req: any) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.id) {
        throw new BadRequestException('Usuario no autenticado');
      }

      // Verificar que sea un paciente
      if (req.user.role !== 'patient') {
        throw new BadRequestException(
          'Esta funcionalidad es solo para pacientes',
        );
      }

      const patientId = req.user.id;
      const userTenants = req.userTenants; // Tenants del JWT

      return this.patientService.findMyProfile(patientId, userTenants);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al obtener el perfil del paciente: ' + error.message,
      );
    }
  }
  @Patch('my-profile')
  @ApiTags('Mobile - Patient Profile')
  @RequirePermission(Permission.UPDATE_OWN_SETTINGS)
  @ApiOperation({
    summary: 'Update patient own profile with multitenant support',
    description:
      'Updates the profile for the authenticated patient across all their associated organizations. Patient ID is extracted from JWT token automatically. This endpoint is designed for mobile applications. Accepts partial data for flexible updates.',
  })
  @ApiBody({
    description: 'Partial patient data to update',
    type: MedicalPatientDto,
    examples: {
      updatePersonalInfo: {
        summary: 'Update personal information only',
        description: 'Example of updating only user personal data',
        value: {
          user: {
            name: 'Juan Carlos',
            last_name: 'Pérez García',
            phone: '+1234567890',
            phone_prefix: '+52',
          },
        },
      },
      updatePatientInfo: {
        summary: 'Update patient-specific information only',
        description: 'Example of updating only patient-specific data',
        value: {
          patient: {
            direction: 'Nueva Av. Principal 123',
            city: 'Ciudad de México',
            province: 'CDMX',
            country: 'México',
            postal_code: '12345',
          },
        },
      },
      updateBoth: {
        summary: 'Update both user and patient information',
        description: 'Example of updating both user and patient data',
        value: {
          user: {
            name: 'Juan Carlos',
            last_name: 'Pérez García',
            phone: '+1234567890',
          },
          patient: {
            direction: 'Nueva Av. Principal 123',
            city: 'Ciudad de México',
            country: 'México',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient profile updated successfully',
    type: UpdatePatientProfileMobileResponseDto,
    content: {
      'application/json': {
        example: {
          message: 'Perfil actualizado correctamente',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - User is not a patient or invalid data',
    content: {
      'application/json': {
        examples: {
          notPatient: {
            summary: 'User is not a patient',
            value: {
              statusCode: 400,
              message: 'Esta funcionalidad es solo para pacientes',
              error: 'Bad Request',
            },
          },
          notAuthenticated: {
            summary: 'User not authenticated',
            value: {
              statusCode: 400,
              message: 'Usuario no autenticado',
              error: 'Bad Request',
            },
          },
          invalidData: {
            summary: 'Invalid update data',
            value: {
              statusCode: 400,
              message: 'Datos de actualización inválidos',
              error: 'Bad Request',
            },
          },
          noOrganizations: {
            summary: 'No organizations associated',
            value: {
              statusCode: 404,
              message: 'No se encontraron organizaciones asociadas al paciente',
              error: 'Not Found',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden - Insufficient permissions to update own profile settings',
  })
  async updateMyProfile(
    @Body() updateData: Partial<MedicalPatientDto>,
    @Request() req: any,
  ) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.id) {
        throw new BadRequestException('Usuario no autenticado');
      }

      // Verificar que sea un paciente
      if (req.user.role !== 'patient') {
        throw new BadRequestException(
          'Esta funcionalidad es solo para pacientes',
        );
      }

      const patientId = req.user.id;
      const userTenants = req.userTenants; // Tenants del JWT

      return this.patientService.updateMyProfile(
        patientId,
        updateData,
        userTenants,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al actualizar el perfil del paciente: ' + error.message,
      );
    }
  }
}
