import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientInsurance } from './entities/patient-insurance.interface';
import { CreatePatientInsuranceDto } from './dto/create-patient-insurance.dto';
import { UpdatePatientInsuranceDto } from './dto/update-patient-insurance.dto';

@Injectable()
export class PatientInsuranceService {

  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreatePatientInsuranceDto): Promise<PatientInsurance> {
    const foundPatientInsurance = await this.findPatientInsuranceByPatientId(request.patient_id);
    if (foundPatientInsurance) {
      throw new BadRequestException('El paciente ya tiene una aseguradora');
    }

    if (! await this.existsPatientByPatientId(request.patient_id)) {
      throw new BadRequestException('El paciente no existe');
    }

    return await this.prisma.patient_insurance.create({
      data: request,
    });
  }

  async update(request: UpdatePatientInsuranceDto): Promise<PatientInsurance> {
    const foundPatientInsurance = await this.findPatientInsuranceById(request.insurance_id);
    if (!foundPatientInsurance) {
      throw new BadRequestException('La aseguradora no existe');
    }

    if (! await this.existsPatientByPatientId(foundPatientInsurance.patient_id)) {
      throw new BadRequestException('El paciente no existe');
    }

    const updatedPatientInsurance = await this.prisma.patient_insurance.update({
      where: { id: request.insurance_id },
      data: {
        insurance_provider: request.insurance_provider || foundPatientInsurance.insurance_provider,
        insurance_number: request.insurance_number || foundPatientInsurance.insurance_number,
        insurance_status: request.insurance_status || foundPatientInsurance.insurance_status,
      },
    });

    return {
      id: updatedPatientInsurance.id,
      patient_id: updatedPatientInsurance.patient_id,
      insurance_provider: updatedPatientInsurance.insurance_provider,
      insurance_number: updatedPatientInsurance.insurance_number,
      insurance_status: updatedPatientInsurance.insurance_status,
    }
  }

  async findPatientInsuranceById(id: string): Promise<PatientInsurance | null>{
    return await this.prisma.patient_insurance.findUnique({
      where: { id: id },
    });
  }

  async findPatientInsuranceByPatientId(id: string): Promise<PatientInsurance | null>{
    return await this.prisma.patient_insurance.findUnique({
      where: {
        patient_id: id,
      },
    });
  }

  async existsPatientByPatientId(id: string): Promise<boolean>{
    const foundPatient = await this.prisma.patient.findUnique({
      where: {
        id: id,
      },
    });
    return foundPatient !== null;
  }
}
