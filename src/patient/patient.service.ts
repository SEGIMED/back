import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/services/email/email.service';
import { MedicalPatientDto } from './dto/medical-patient.dto';
import { sendCredentialsHtml } from 'src/services/email/templates/credentialsHtml';
import { GetPatientDto, GetPatientsDto } from './dto/get-patient.dto';
import {
  PaginationParams,
  parsePaginationAndSorting,
} from 'src/utils/pagination.helper';
/* import { MedicalPatientDto } from './dto/medical-patient.dto';
 */
@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(medicalPatientDto: MedicalPatientDto): Promise<object> {
    try {
      const { patient, user } = medicalPatientDto;
      const validTenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenant_id },
      });

      if (!validTenant) {
        throw new BadRequestException('El tenant no existe');
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        const patient = await this.prisma.patient.findFirst({
          where: { user_id: existingUser.id },
        });
        if (!patient) {
          throw new BadRequestException(
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
        const newPassword = `${user.name.charAt(0).toUpperCase() + user.name.slice(1) + '.' + user.dni}`;
        return await this.prisma.$transaction(async (transaction) => {
          const newUser = await transaction.user.create({
            data: {
              ...user,
              role: 'patient',
              password: newPassword,
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

          this.emailService.sendMail(
            user.email,
            sendCredentialsHtml(user.email, newPassword),
            'Credenciales Segimed',
          );
          return { message: 'Paciente creado exitosamente' };
        });
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al crear el paciente');
    }
  }

  async findAll(
    tenant_id: string,
    pagination: PaginationParams,
  ): Promise<GetPatientsDto[]> {
    const { skip, take, orderBy, orderDirection } =
      parsePaginationAndSorting(pagination);
    const users = await this.prisma.user.findMany({
      where: {
        role: 'patient',
        tenant_id,
      },
      skip,
      take,
      orderBy: { [orderBy]: orderDirection },
    });
    if (users.length === 0) {
      throw new BadRequestException('No hay pacientes que mostrar.');
    }
    return users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        image: user.image,
        birth_date: user.birth_date,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        prefix: user.phone_prefix,
      };
    });
  }

  async findOne(id: string, tenant_id: string): Promise<GetPatientDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, tenant_id },
      include: { patient: true },
    });
    return {
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      image: user.image,
      birth_date: user.birth_date,
      email: user.email,
      notes: user.patient.notes,
    };
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
