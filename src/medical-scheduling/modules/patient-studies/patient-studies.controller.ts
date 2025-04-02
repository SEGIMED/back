import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { PatientStudiesService } from './patient-studies.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { FileUploadService } from '../../../utils/file_upload/file_upload.service';
import { CatStudyTypeService } from '../../../catalogs/cat-study-type/cat-study-type.service';
import { GetTenant } from 'src/auth/decorators/get-tenant.decorator';

@Controller('patient-studies')
export class PatientStudiesController {
  constructor(
    private readonly patientStudiesService: PatientStudiesService,
    private readonly fileUploadService: FileUploadService,
    private readonly catStudyTypeService: CatStudyTypeService,
  ) {}

  @Post()
  async create(
    @GetTenant() tenantId: string | any,
    @Body() createPatientStudyDto: CreatePatientStudyDto,
  ) {
    const catStudyType = await this.catStudyTypeService.findOne(
      createPatientStudyDto.cat_study_type_id,
    );
    if (!catStudyType) {
      throw new BadRequestException('Invalid cat_study_type_id');
    }

    // Asegurar que tenantId sea una cadena de texto
    const tenant =
      typeof tenantId === 'object' && tenantId !== null
        ? tenantId.id
        : tenantId;

    // Si hay un archivo en base64, subirlo a Cloudinary
    if (createPatientStudyDto.file) {
      try {
        const uploadResult = await this.fileUploadService.uploadBase64File(
          createPatientStudyDto.file,
          `patient-study-${createPatientStudyDto.patient_id}-${Date.now()}`,
        );
        createPatientStudyDto.url = uploadResult.url;
        // Eliminar la propiedad file para evitar errores con Prisma
        delete createPatientStudyDto.file;
      } catch (error) {
        console.error('Error al subir archivo:', error);
        throw new BadRequestException(
          'Error al procesar el archivo adjunto: ' + error.message,
        );
      }
    }

    return this.patientStudiesService.create(createPatientStudyDto, tenant);
  }

  @Get()
  findAll() {
    return this.patientStudiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientStudiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientStudyDto: UpdatePatientStudyDto,
  ) {
    const catStudyType = await this.catStudyTypeService.findOne(
      updatePatientStudyDto.cat_study_type_id,
    );
    if (!catStudyType) {
      throw new BadRequestException('Invalid cat_study_type_id');
    }

    // Si hay un archivo en base64, subirlo a Cloudinary
    if (updatePatientStudyDto.file) {
      try {
        const uploadResult = await this.fileUploadService.uploadBase64File(
          updatePatientStudyDto.file,
          `patient-study-${updatePatientStudyDto.patient_id}-${Date.now()}`,
        );
        updatePatientStudyDto.url = uploadResult.url;
        // Eliminar la propiedad file para evitar errores con Prisma
        delete updatePatientStudyDto.file;
      } catch (error) {
        console.error('Error al subir archivo:', error);
        throw new BadRequestException(
          'Error al procesar el archivo adjunto: ' + error.message,
        );
      }
    }

    return this.patientStudiesService.update(id, updatePatientStudyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientStudiesService.remove(id);
  }
}
