import { Body, Controller, Post } from '@nestjs/common';
import { PatientInsuranceService } from './patient-insurance.service';
import { CreatePatientInsuranceDto } from './dto/create-patient-insurance.dto';
import { PatientInsurance } from './entities/patient-insurance.interface';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('patient-insurance')
export class PatientInsuranceController {
  constructor(private readonly patientInsuranceService: PatientInsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva aseguradora para un paciente' })
  @ApiResponse({ status: 201, description: 'Aseguradora creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al crear la aseguradora' })
  create(@Body() request: CreatePatientInsuranceDto): Promise<PatientInsurance> {
    return this.patientInsuranceService.create(request);
  }
}
