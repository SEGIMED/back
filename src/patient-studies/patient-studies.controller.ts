import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientStudiesService } from './patient-studies.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';
import { FileUploadService } from '../file_upload/file_upload.service';
import { Multer } from 'multer';

@Controller('patient-studies')
export class PatientStudiesController {
  constructor(
    private readonly patientStudiesService: PatientStudiesService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024, // 5MB
            message: 'Exceeds the maximum allowed size of 5MB'
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg))$/
          })
        ]
      })
    ) file: Multer.File,
    @Body() createPatientStudyDto: CreatePatientStudyDto
  ) {
    const uploadResult = await this.fileUploadService.uploadImage(file);
    createPatientStudyDto.url = uploadResult.url;
    return this.patientStudiesService.create(createPatientStudyDto);
  }

  @Post('upload/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF
            message: 'PDF exceeds the maximum allowed size of 10MB'
          }),
          new FileTypeValidator({
            fileType: /^application\/pdf$/
          })
        ]
      })
    ) file: Multer.File,
    @Body() createPatientStudyDto: CreatePatientStudyDto
  ) {
    const uploadResult = await this.fileUploadService.uploadDocument(file);
    createPatientStudyDto.url = uploadResult.url;
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
    @Body() updatePatientStudyDto: UpdatePatientStudyDto
  ) {
    return this.patientStudiesService.update(id, updatePatientStudyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientStudiesService.remove(id);
  }
}
