import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseUUIDPipe,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientStudiesService } from './patient-studies.service';
import {
  CreatePatientStudyDto,
  CreatePatientOwnStudyDto,
} from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service'; // Corrected import path
import { GetTenant } from 'src/auth/decorators/get-tenant.decorator';
import { TenantAccessGuard } from '../../../auth/guards/tenant-access.guard';
import { PermissionGuard } from '../../../auth/guards/permission.guard';
import { RequirePermission } from '../../../auth/decorators/require-permission.decorator';
import { Permission } from '../../../auth/permissions/permission.enum';

@ApiTags('Patient Studies')
@ApiBearerAuth('JWT')
@ApiHeader({
  name: 'tenant_id',
  description: 'Tenant ID',
  required: true,
})
@Controller('patient-studies')
@UseGuards(TenantAccessGuard, PermissionGuard)
export class PatientStudiesController {
  constructor(
    private readonly patientStudiesService: PatientStudiesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new patient study',
    description:
      'Creates a patient study. Behavior depends on user role:\n\n' +
      '**For Patients**: Creates their own study without tenant association. Patient ID and physician ID are taken from JWT token. Only requires basic study information. Requires `REGISTER_OWN_VITAL_SIGNS` permission.\n\n' +
      '**For Physicians**: Creates a study for a patient. Physician ID is taken from JWT token, but patient ID and tenant ID must be provided. Requires `MANAGE_CATALOGS` permission.',
  })
  @ApiResponse({
    status: 201,
    description: 'The patient study has been successfully created.',
    content: {
      'application/json': {
        examples: {
          'patient-study': {
            summary: 'Study created by patient',
            value: {
              id: 'uuid-study',
              patient_id: 'uuid-patient',
              physician_id: 'uuid-patient',
              title: 'Mi Radiografía de Tórax',
              description: 'Estudio personal de rutina',
              cat_study_type_id: 1,
              tenant_id: null,
              url: 'https://example.com/mi-estudio.pdf',
              is_deleted: false,
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
            },
          },
          'physician-study': {
            summary: 'Study created by physician',
            value: {
              id: 'uuid-study',
              patient_id: 'uuid-patient',
              physician_id: 'uuid-physician',
              title: 'Análisis de Sangre',
              description: 'Estudio solicitado por médico',
              cat_study_type_id: 2,
              tenant_id: 'uuid-organization',
              url: 'https://example.com/estudio.pdf',
              is_deleted: false,
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or missing required fields.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  @ApiBody({
    description: 'Study data. Required fields depend on user role.',
    schema: {
      oneOf: [
        {
          title: 'Patient Study Creation',
          allOf: [{ $ref: '#/components/schemas/CreatePatientOwnStudyDto' }],
          description: 'For patients creating their own studies',
        },
        {
          title: 'Physician Study Creation',
          allOf: [{ $ref: '#/components/schemas/CreatePatientStudyDto' }],
          description: 'For physicians creating studies for patients',
        },
      ],
    },
  })
  async create(
    @Body() createStudyDto: CreatePatientOwnStudyDto | CreatePatientStudyDto,
    @Request() req: any,
    @GetTenant('tenant_id') tenant_id?: string,
  ) {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Manejar archivos si existen
    if ('study_file' in createStudyDto && createStudyDto.study_file) {
      try {
        const filename = `patient-studies/${tenant_id || 'patient-own'}/${Date.now()}`;
        const data = await this.fileUploadService.uploadBase64File(
          createStudyDto.study_file,
          filename,
        );
        createStudyDto.study_file = data.url;
      } catch (error) {
        throw new BadRequestException(
          `Error al subir archivo: ${error.message}`,
        );
      }
    }

    // Comportamiento según el rol del usuario
    if (userRole === 'patient') {
      // Para pacientes: crear estudio propio sin tenant
      const patientDto = createStudyDto as CreatePatientOwnStudyDto;

      // Verificar que los campos requeridos estén presentes
      if (
        !patientDto.title ||
        !patientDto.description ||
        !patientDto.cat_study_type_id
      ) {
        throw new BadRequestException(
          'Para pacientes se requieren: title, description, cat_study_type_id',
        );
      }

      return this.patientStudiesService.createPatientOwnStudy(
        patientDto,
        userId, // patient_id del token
      );
    } else if (userRole === 'physician') {
      // Para médicos: crear estudio para paciente con tenant
      const physicianDto = createStudyDto as CreatePatientStudyDto;

      // Verificar que los campos requeridos estén presentes
      if (
        !physicianDto.patient_id ||
        !physicianDto.title ||
        !physicianDto.description ||
        !physicianDto.cat_study_type_id
      ) {
        throw new BadRequestException(
          'Para médicos se requieren: patient_id, title, description, cat_study_type_id',
        );
      }

      if (!tenant_id) {
        throw new BadRequestException(
          'Se requiere tenant_id en el header para médicos',
        );
      }

      return this.patientStudiesService.createByPhysician(
        physicianDto,
        userId, // physician_id del token
        tenant_id,
      );
    } else {
      throw new BadRequestException(
        'Solo pacientes y médicos pueden crear estudios',
      );
    }
  }

  @Get()
  @RequirePermission(Permission.VIEW_PATIENTS_LIST)
  @ApiOperation({ summary: 'Get all patient studies' })
  @ApiResponse({
    status: 200,
    description: 'List of all patient studies.',
    type: [CreatePatientStudyDto], // Assuming it returns an array of patient studies
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.patientStudiesService.findAll();
  }

  @Get('my-studies')
  @RequirePermission(Permission.VIEW_OWN_MEDICAL_RECORDS)
  @ApiOperation({
    summary: 'Get my patient studies with multitenant support',
    description:
      'Gets all studies for the authenticated patient across all their associated organizations. Uses patient ID from JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of patient studies from all organizations.',
    content: {
      'application/json': {
        example: [
          {
            id: 'uuid-study',
            patient_id: 'uuid-patient',
            title: 'Radiografía de Tórax',
            description: 'Estudio de rutina',
            study_type: 'Radiología',
            study_date: '2024-01-15T00:00:00Z',
            institution: 'Hospital Central',
            study_file: 'https://example.com/study.pdf',
            tenant_id: 'uuid-organization',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User is not a patient or request is invalid.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
  })
  async getMyStudies(@Request() req: any) {
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
    const userTenants = req.userTenants || [];

    return this.patientStudiesService.findByPatientId(patientId, userTenants);
  }

  @Get('by-patient/:patient_id')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({
    summary: 'Get patient studies by patient ID (for healthcare providers)',
    description:
      'Gets all studies for a specific patient across all their associated organizations. This endpoint is for healthcare providers to view patient studies.',
  })
  @ApiParam({ name: 'patient_id', description: 'ID of the patient' })
  @ApiResponse({
    status: 200,
    description: 'List of patient studies.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findByPatientId(
    @Param('patient_id') patientId: string,
    @Request() req: any,
  ) {
    const userTenants = req.userTenants || [];
    return this.patientStudiesService.findByPatientId(patientId, userTenants);
  }

  @Get(':id')
  @RequirePermission(Permission.VIEW_PATIENT_DETAILS)
  @ApiOperation({ summary: 'Get a patient study by ID' })
  @ApiParam({ name: 'id', description: 'ID of the patient study' })
  @ApiResponse({
    status: 200,
    description: 'The patient study.',
    type: CreatePatientStudyDto, // Assuming it returns a single patient study
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Patient study not found.' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: string,
  ) {
    return this.patientStudiesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(Permission.EDIT_PATIENT_INFO)
  @ApiOperation({ summary: 'Update a patient study by ID' })
  @ApiParam({ name: 'id', description: 'ID of the patient study to update' })
  @ApiBody({ type: UpdatePatientStudyDto })
  @ApiResponse({
    status: 200,
    description: 'The patient study has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Patient study not found.' })
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: string,
    @Body() updatePatientStudyDto: UpdatePatientStudyDto,
    @GetTenant('tenant_id') tenant_id: string,
  ) {
    if (updatePatientStudyDto.study_file) {
      try {
        // Assuming study_file is a base64 data URI
        const filename = `patient-studies/${tenant_id}/${Date.now()}`;
        const data = await this.fileUploadService.uploadBase64File(
          updatePatientStudyDto.study_file,
          filename,
        );
        updatePatientStudyDto.study_file = data.url; // Use data.url
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    return this.patientStudiesService.update(id, updatePatientStudyDto);
  }

  @Delete(':id')
  @RequirePermission(Permission.DELETE_PATIENTS)
  @ApiOperation({ summary: 'Delete a patient study by ID' })
  @ApiParam({ name: 'id', description: 'ID of the patient study to delete' })
  @ApiResponse({
    status: 200,
    description: 'The patient study has been successfully deleted.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Patient study not found.' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: string,
  ) {
    return this.patientStudiesService.remove(id);
  }
}
