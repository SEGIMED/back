import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
  ){}
  async create(createPatientDto: CreatePatientDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createPatientDto.email },
    });
    createPatientDto.userId = user.id
    const { email, ...filteredDto } = createPatientDto;
    const patient = await this.prisma.patient.create({
      data: filteredDto as any
    })
    return patient;
  }

  async findAll() {
    const users = await this.prisma.patient.findMany()
    return users;
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: {id: id}
    })
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const {email, ...filteredDto} = updatePatientDto
    const newPatient = await this.prisma.patient.update({
      where: {id: id},
      data: filteredDto as any
    })
    return newPatient;
  }

  remove(id: string) {
    return this.prisma.patient.delete({ where: { id: id} });;
  }
}
