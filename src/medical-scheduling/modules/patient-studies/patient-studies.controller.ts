import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientStudiesService } from './patient-studies.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { FileUploadService } from '../../../utils/file_upload/file_upload.service';
import { Multer } from 'multer';
import { CatStudyTypeService } from '../../../catalogs/cat-study-type/cat-study-type.service';

@Controller('patient-studies')
export class PatientStudiesController {
  constructor(
    private readonly patientStudiesService: PatientStudiesService,
    private readonly fileUploadService: FileUploadService,
    private readonly catStudyTypeService: CatStudyTypeService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF, 5MB para imágenes
            message:
              'File exceeds the maximum size of 10MB for PDFs or 5MB for images',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg)|application\/pdf)$/i,
          }),
        ],
      }),
    )
    file: Multer.File,
    @Body() createPatientStudyDto: CreatePatientStudyDto,
  ) {
    const catStudyType = await this.catStudyTypeService.findOne(
      createPatientStudyDto.cat_study_type_id,
    );
    if (!catStudyType) {
      throw new BadRequestException('Invalid cat_study_type_id');
    }
    if (file) {
      const uploadResult = await this.fileUploadService.uploadFile(file);
      createPatientStudyDto.url = uploadResult.url;
    }
    return this.patientStudiesService.create(createPatientStudyDto);
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
    return this.patientStudiesService.update(id, updatePatientStudyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientStudiesService.remove(id);
  }
}
