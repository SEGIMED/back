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

      const newPassword = `${user.name.charAt(0).toUpperCase() + user.name.slice(1) + '.' + user.dni}`;
      const existingUserWithSameTenant = await this.prisma.user.findFirst({
        where: {
          email: user.email,
        },
        include: {
          patient: {
            include: {
              patient_tenant: true,
            },
          },
        },
      });
      if (
        existingUserWithSameTenant.patient.patient_tenant.includes(
          global.tenant_id,
        )
      ) {
        throw new BadRequestException(
          'El usuario ya existe para esta organización',
        );
      }

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
            tenant_id: global.tenant_id,
          },
        });

        await this.emailService.sendMail(
          user.email,
          sendCredentialsHtml(user.email, newPassword),
          'Credenciales Segimed',
        );

        return { message: 'Paciente creado exitosamente' };
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al crear el paciente: ' + error.message,
      );
    }
  }

  async findAll(
    tenant_id: string,
    pagination: PaginationParams,
  ): Promise<GetPatientsDto[]> {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(pagination);
      const users = await this.prisma.user.findMany({
        where: {
          role: 'patient',
          patient: {
            patient_tenant: {
              some: {
                tenant_id: tenant_id,
              },
            },
          },
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
    } catch (error) {
      console.error('Error en findAll:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener los pacientes');
    }
  }

  async findOne(id: string, tenant_id: string): Promise<GetPatientDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id, tenant_id },
        include: { patient: true },
      });

      if (!user) {
        throw new BadRequestException('Paciente no encontrado');
      }

      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        image: user.image,
        birth_date: user.birth_date,
        email: user.email,
        notes: user.patient.notes,
      };
    } catch (error) {
      console.error('Error en findOne:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener el paciente');
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      const { ...filteredDto } = updatePatientDto;
      const newPatient = await this.prisma.patient.update({
        where: { id: id },
        data: filteredDto as any,
      });
      return newPatient;
    } catch (error) {
      console.error('Error en update:', error);
      if (error?.code === 'P2025') {
        throw new BadRequestException('Paciente no encontrado');
      }
      throw new BadRequestException('Error al actualizar el paciente');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.patient.delete({ where: { id: id } });
    } catch (error) {
      console.error('Error en remove:', error);
      if (error?.code === 'P2025') {
        throw new BadRequestException('Paciente no encontrado');
      }
      throw new BadRequestException('Error al eliminar el paciente');
    }
  }
}
