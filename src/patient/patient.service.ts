import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MedicalPatientDto } from './dto/medical-patient.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.interface';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

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
    const patient = await this.prisma.patient.create({
      data: createPatientDto as any
    })
    return patient;
  }

  async createMedical(medicalPatientDto: MedicalPatientDto){
    try {
      medicalPatientDto.role = "PATIENT"
      const user = await this.prisma.user.create({
        data: {
          name: medicalPatientDto.name,
          email: medicalPatientDto.email,
          role: medicalPatientDto.role,
          tenant_id: medicalPatientDto.tenant_id,
          phone: medicalPatientDto.phone,
          phone_prefix: medicalPatientDto.phone_prefix,
          dni: medicalPatientDto.dni
        }
      }).catch( (err) => {
        throw new Error(err)
      })
      
      
      const patient = await this.prisma.patient.create({
        data: {
          direction: medicalPatientDto.direction,
          country: medicalPatientDto.country,
          city: medicalPatientDto.city,
          province: medicalPatientDto.province,
          postal_code: medicalPatientDto.postal_code,
          direction_number: medicalPatientDto.direction_number,
          apparment: medicalPatientDto.apparment,
          last_name: medicalPatientDto.last_name,
          userId: user.id
        }
      }).catch( (err) => {
        throw new Error(err)
      })
      return {message: 'El paciente ha sido creado', paciente: patient}
    } catch (error) {
      console.log(error )
      return {Error: 'Error al crear el usuario'}
    }
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
