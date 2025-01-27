import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientStudiesService } from './patient-studies.service';
import { CreatePatientStudyDto } from './dto/create-patient-study.dto';
import { UpdatePatientStudyDto } from './dto/update-patient-study.dto';

@Controller('patient-studies')
export class PatientStudiesController {
  constructor(private readonly patientStudiesService: PatientStudiesService) {}

  @Post()
  create(@Body() createPatientStudyDto: CreatePatientStudyDto) {
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
  update(@Param('id') id: string, @Body() updatePatientStudyDto: UpdatePatientStudyDto) {
    return this.patientStudiesService.update(id, updatePatientStudyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientStudiesService.remove(id);
  }
}