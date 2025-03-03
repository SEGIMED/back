import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dto/update-patient.dto';

import { MedicalPatientDto } from './dto/medical-patient.dto';
import { Request } from 'express';
import { PaginationParams } from 'src/utils/pagination.helper';
/* import { MedicalPatientDto } from './dto/medical-patient.dto';
 */
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Body() medicalPatientDto: MedicalPatientDto): Promise<object> {
    console.log(medicalPatientDto);
    return this.patientService.create(medicalPatientDto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() pagination: PaginationParams) {
    const tenant_id = req['tenant_id'];
    return this.patientService.findAll(tenant_id, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const tenant_id = req['tenant_id'];
    return this.patientService.findOne(id, tenant_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
