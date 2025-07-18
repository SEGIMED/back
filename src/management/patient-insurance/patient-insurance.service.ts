import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientInsurance } from './entities/patient-insurance.interface';
import { CreatePatientInsuranceDto } from './dto/create-patient-insurance.dto';

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
