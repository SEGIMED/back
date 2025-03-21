import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { UserRoleManagerService } from '../../auth/roles/user-role-manager.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly userRoleManager: UserRoleManagerService,
  ) {}

  async create(medicalPatientDto: MedicalPatientDto): Promise<object> {
    try {
      const { patient, user } = medicalPatientDto;

      const tenant_id = global.tenant_id;

      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      const newPassword = `${user.name.charAt(0).toUpperCase() + user.name.slice(1) + '.' + user.dni}`;

      const existingUserWithSameTenant = await this.prisma.user.findFirst({
        where: {
          email: user.email,
        },
        include: {
          patient: {
            include: {
              patient_tenant: {
                where: {
                  tenant_id: tenant_id,
                  deleted: false,
                },
              },
            },
          },
        },
      });

      if (
        existingUserWithSameTenant &&
        existingUserWithSameTenant.patient &&
        existingUserWithSameTenant.patient.patient_tenant &&
        existingUserWithSameTenant.patient.patient_tenant.length > 0
      ) {
        throw new BadRequestException(
          'El usuario ya existe para esta organización',
        );
      }

      let newUserId: string;

      await this.prisma.$transaction(async (transaction) => {
        const newUser = await transaction.user.create({
          data: {
            ...user,
            role: 'patient',
            password: newPassword,
          },
        });

        newUserId = newUser.id;

        const newPatient = await transaction.patient.create({
          data: {
            ...patient,
            user_id: newUser.id,
          },
        });

        await transaction.patient_tenant.create({
          data: {
            patient_id: newPatient.id,
            tenant_id: tenant_id,
          },
        });

        await this.emailService.sendMail(
          user.email,
          sendCredentialsHtml(user.email, newPassword),
          'Credenciales Segimed',
        );
      });

      await this.userRoleManager.assignDefaultRoleToUser(
        newUserId,
        'patient',
        tenant_id,
      );

      return { message: 'Paciente creado exitosamente' };
    } catch (error) {
      console.error('Error al crear paciente:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Error al crear el paciente: ' + error.message,
      );
    }
  }

  async findAll(
    pagination: PaginationParams,
    searchQuery?: string,
  ): Promise<GetPatientsDto[]> {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(pagination);

      const tenant_id = global.tenant_id;

      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      let searchFilter: Prisma.patientWhereInput = {};
      console.log('searchQuery', searchQuery);
      if (searchQuery) {
        searchFilter = {
          OR: [
            { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
            {
              user: {
                last_name: { contains: searchQuery, mode: 'insensitive' },
              },
            },
            { user: { dni: { contains: searchQuery, mode: 'insensitive' } } },
            {
              health_care_number: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      const patients = await this.prisma.patient.findMany({
        where: {
          patient_tenant: {
            some: {
              tenant_id: tenant_id,
              deleted: false,
            },
          },
          user: {
            role: 'patient',
          },
          ...searchFilter,
        },
        include: {
          user: true,
        },
        skip,
        take,
        orderBy:
          orderBy === 'name' ||
          orderBy === 'last_name' ||
          orderBy === 'email' ||
          orderBy === 'dni'
            ? { user: { [orderBy]: orderDirection } }
            : { [orderBy]: orderDirection },
      });

      if (patients.length === 0) {
        throw new NotFoundException('No hay pacientes que mostrar.');
      }

      return patients.map((patient) => {
        const user = patient.user;
        return {
          id: user.id,
          name: user.name,
          last_name: user.last_name || '',
          image: user.image,
          birth_date: user.birth_date,
          gender: user.gender || '',
          email: user.email,
          phone: user.phone || '',
          prefix: user.phone_prefix || '',
          dni: user.dni || '',
          health_care_number: patient.health_care_number || '',
        };
      });
    } catch (error) {
      console.error('Error en findAll:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener los pacientes');
    }
  }

  async findOne(id: string): Promise<GetPatientDto> {
    try {
      const tenant_id = global.tenant_id;

      console.log('tenant_id', tenant_id);
      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      const patient = await this.prisma.patient.findFirst({
        where: {
          user_id: id,
          patient_tenant: {
            some: {
              tenant_id,
              deleted: false,
            },
          },
        },
        include: {
          user: true,
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado en este tenant');
      }

      const user = patient.user;

      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name || '',
        image: user.image,
        birth_date: user.birth_date,
        email: user.email,
        notes: patient.notes || '',
      };
    } catch (error) {
      console.error('Error en findOne:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener el paciente');
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      const tenant_id = global.tenant_id;

      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      const patient = await this.prisma.patient.findFirst({
        where: {
          user_id: id,
          patient_tenant: {
            some: {
              tenant_id,
              deleted: false,
            },
          },
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado en este tenant');
      }

      const { ...filteredDto } = updatePatientDto;

      const updatedPatient = await this.prisma.patient.update({
        where: { user_id: id },
        data: filteredDto as any,
      });

      return updatedPatient;
    } catch (error) {
      console.error('Error en update:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.code === 'P2025') {
        throw new NotFoundException('Paciente no encontrado');
      }
      throw new BadRequestException('Error al actualizar el paciente');
    }
  }

  async remove(id: string) {
    try {
      const tenant_id = global.tenant_id;

      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      const patient = await this.prisma.patient.findFirst({
        where: {
          user_id: id,
          patient_tenant: {
            some: {
              tenant_id,
              deleted: false,
            },
          },
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado en este tenant');
      }

      const patientTenant = await this.prisma.patient_tenant.findFirst({
        where: {
          patient_id: patient.id,
          tenant_id,
          deleted: false,
        },
      });

      if (!patientTenant) {
        throw new ForbiddenException(
          'No tiene permiso para eliminar este paciente',
        );
      }

      await this.prisma.patient_tenant.update({
        where: {
          id: patientTenant.id,
        },
        data: {
          deleted: true,
          deleted_at: new Date(),
        },
      });

      return { message: 'Paciente eliminado correctamente del tenant' };
    } catch (error) {
      console.error('Error en remove:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el paciente');
    }
  }
}
