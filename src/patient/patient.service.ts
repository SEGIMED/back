import { Injectable } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
/* import { MedicalPatientDto } from './dto/medical-patient.dto';
 */
@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(medicalPatientDto: any): Promise<object> {
    try {
      const { patient, user } = medicalPatientDto;
      const validTenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenant_id },
      });

      if (!validTenant) {
        throw new Error('El tenant no existe');
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        const patient = await this.prisma.patient.findFirst({
          where: { user_id: existingUser.id },
        });
        if (!patient) {
          throw new Error(
            'El usuario ya existe pero no es un paciente. Contactar a soporte.',
          );
        }
        await this.prisma.patient_tenant.create({
          data: {
            patient_id: patient.id,
            tenant_id: user.tenant_id,
          },
        });
        return { message: 'Paciente asociado exitosamente' };
      } else {
        await this.prisma.$transaction(async (transaction) => {
          const newUser = await transaction.user.create({
            data: {
              ...user,
              role: 'patient',
            },
          });
          const newPatient = await transaction.patient.create({
            data: {
              ...patient,
              user_id: newUser.id,
            },
          });
          await transaction.patient_tenant.create({
            data: {
              patient_id: newPatient.id,
              tenant_id: user.tenant_id,
            },
          });
        });
        return { message: 'Paciente creado exitosamente' };
      }
    } catch (error) {
      console.log(error);
      throw new Error('Error al crear el paciente');
    }
  }

  async findAll() {
    const users = await this.prisma.patient.findMany();
    return users;
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: id },
    });
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const { ...filteredDto } = updatePatientDto;
    const newPatient = await this.prisma.patient.update({
      where: { id: id },
      data: filteredDto as any,
    });
    return newPatient;
  }

  remove(id: string) {
    return this.prisma.patient.delete({ where: { id: id } });
  }
}
