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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PatientStudiesService } from './patient-studies.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service'; // Corrected import path
import { GetTenant } from 'src/auth/decorators/get-tenant.decorator';

@ApiTags('Patient Studies')
@ApiHeader({
  name: 'tenant_id',
  description: 'Tenant ID',
  required: true,
})
@Controller('patient-studies')
export class PatientStudiesController {
  constructor(
    private readonly patientStudiesService: PatientStudiesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient study' })
  @ApiResponse({
    status: 201,
    description: 'The patient study has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreatePatientStudyDto })
  async create(
    @Body() createPatientStudyDto: CreatePatientStudyDto,
    @GetTenant('tenant_id') tenant_id: string,
  ) {
    if (createPatientStudyDto.study_file) {
      try {
        // Assuming study_file is a base64 data URI
        const filename = `patient-studies/${tenant_id}/${Date.now()}`;
        const data = await this.fileUploadService.uploadBase64File(
          createPatientStudyDto.study_file,
          filename,
        );
        createPatientStudyDto.study_file = data.url; // Use data.url
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    return this.patientStudiesService.create(createPatientStudyDto, tenant_id);
  }

  @Get()
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

  @Get(':id')
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
