import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
import { AuthHelper } from 'src/utils/auth.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
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

      // Buscar si ya existe un usuario con ese email
      const existingUser = await this.prisma.user.findFirst({
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

      // Si el usuario ya existe y ya tiene este tenant asociado, devolver error
      if (
        existingUser &&
        existingUser.patient &&
        existingUser.patient.patient_tenant &&
        existingUser.patient.patient_tenant.length > 0
      ) {
        throw new BadRequestException(
          'El usuario ya existe para esta organización',
        );
      }

      // Si el usuario existe pero NO tiene el tenant asociado, agregarlo
      if (existingUser && existingUser.patient) {
        console.log(
          `🔗 Usuario existente encontrado: ${existingUser.email}. Asociando al tenant: ${tenant_id}`,
        );

        await this.prisma.$transaction(async (transaction) => {
          // Crear la asociación patient_tenant
          await transaction.patient_tenant.create({
            data: {
              patient_id: existingUser.patient.id,
              tenant_id: tenant_id,
            },
          });

          // Asignar el rol de paciente para este tenant
          await this.userRoleManager.assignDefaultRoleToUser(
            existingUser.id,
            'patient',
            tenant_id,
          );
        });

        return {
          message: 'Paciente asociado exitosamente a la organización',
          userId: existingUser.id,
          action: 'associated',
        };
      }

      // Si el usuario existe pero NO es paciente, convertirlo en paciente
      if (existingUser && !existingUser.patient) {
        console.log(
          `🔄 Usuario existente encontrado pero no es paciente: ${existingUser.email}. Creando registro de paciente.`,
        );

        let patientId: string;
        await this.prisma.$transaction(async (transaction) => {
          // Crear el registro de paciente
          const newPatient = await transaction.patient.create({
            data: {
              ...patient,
              user_id: existingUser.id,
            },
          });

          patientId = newPatient.id;

          // Crear la asociación patient_tenant
          await transaction.patient_tenant.create({
            data: {
              patient_id: newPatient.id,
              tenant_id: tenant_id,
            },
          });

          // Actualizar el rol del usuario a paciente si es necesario
          if (existingUser.role !== 'patient') {
            await transaction.user.update({
              where: { id: existingUser.id },
              data: { role: 'patient' },
            });
          }
        });

        // Asignar el rol de paciente para este tenant
        await this.userRoleManager.assignDefaultRoleToUser(
          existingUser.id,
          'patient',
          tenant_id,
        );

        return {
          message: 'Usuario convertido a paciente y asociado exitosamente',
          userId: existingUser.id,
          patientId: patientId,
          action: 'converted',
        };
      }

      // Si el usuario NO existe, crear todo desde cero (lógica original)
      console.log(
        `➕ Usuario nuevo: ${user.email}. Creando usuario y paciente desde cero.`,
      );

      let newUserId: string;
      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      );

      await this.prisma.$transaction(async (transaction) => {
        const newUser = await transaction.user.create({
          data: {
            ...user,
            role: 'patient',
            password: await AuthHelper.hashPassword(newPassword, saltRounds),
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

        // Enviar credenciales solo para usuarios nuevos
        await this.emailService.sendMail(
          user.email,
          'Credenciales Segimed',
          sendCredentialsHtml(user.email, newPassword),
        );
      });

      await this.userRoleManager.assignDefaultRoleToUser(
        newUserId,
        'patient',
        tenant_id,
      );

      return {
        message: 'Paciente creado exitosamente',
        userId: newUserId,
        action: 'created',
      };
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
        return [];
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

      // Get patient files (studies)
      const files = await this.prisma.patient_study.findMany({
        where: {
          patient_id: id,
          tenant_id,
          is_deleted: false,
        },
        select: {
          id: true,
          title: true,
          url: true,
        },
      });

      const formattedFiles = files.map((file) => ({
        id: file.id,
        name: file.title,
        url: file.url || '',
      }));

      // Get the latest medical event with status COMPLETED
      const latestMedicalEvent = await this.prisma.medical_event.findFirst({
        where: {
          patient_id: id,
          tenant_id,
          deleted: false,
          appointment: {
            status: 'atendida',
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        include: {
          vital_signs: {
            include: {
              vital_sign: true,
            },
          },
        },
      });

      // Get the latest self evaluation
      const latestSelfEvaluation =
        await this.prisma.self_evaluation_event.findFirst({
          where: {
            patient_id: id,
            tenant_id,
          },
          orderBy: {
            created_at: 'desc',
          },
          include: {
            vital_signs: {
              include: {
                vital_sign: true,
              },
            },
          },
        });

      // Determine which vital signs to use (from most recent source)
      let vitalSignsData = [];
      let vitalSignsSource = null;

      if (latestMedicalEvent && latestSelfEvaluation) {
        const medicalEventDate = new Date(latestMedicalEvent.created_at);
        const selfEvalDate = new Date(latestSelfEvaluation.created_at);

        vitalSignsSource =
          medicalEventDate > selfEvalDate
            ? latestMedicalEvent
            : latestSelfEvaluation;
      } else if (latestMedicalEvent) {
        vitalSignsSource = latestMedicalEvent;
      } else if (latestSelfEvaluation) {
        vitalSignsSource = latestSelfEvaluation;
      }

      if (
        vitalSignsSource &&
        vitalSignsSource.vital_signs &&
        vitalSignsSource.vital_signs.length > 0
      ) {
        // For each vital sign, get the measure unit
        const vitalSignPromises = vitalSignsSource.vital_signs.map(
          async (vs) => {
            if (!vs.vital_sign) return null;

            const measureUnit = await this.prisma.cat_measure_unit.findFirst({
              where: {
                cat_vital_signs: {
                  some: {
                    id: vs.vital_sign_id,
                  },
                },
              },
            });

            return {
              id: vs.id,
              vital_sign_category: vs.vital_sign.name,
              measure: vs.measure,
              vital_sign_measure_unit: measureUnit ? measureUnit.name : '',
            };
          },
        );

        const results = await Promise.all(vitalSignPromises);
        vitalSignsData = results.filter((item) => item !== null);
      }

      // Get the latest patient background
      const background = await this.prisma.background.findFirst({
        where: {
          patient_id: id,
          tenant_id,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Get active medications
      const medications = await this.prisma.prescription.findMany({
        where: {
          patient_id: id,
          tenant_id,
          active: true,
        },
        include: {
          pres_mod_history: {
            orderBy: {
              mod_timestamp: 'desc',
            },
            take: 1,
          },
        },
      });

      const formattedMedications = medications.map((med) => {
        const lastModification =
          med.pres_mod_history && med.pres_mod_history.length > 0
            ? med.pres_mod_history[0]
            : null;
        return {
          id: med.id,
          name: med.monodrug,
          dosage: lastModification
            ? `${lastModification.dose} ${lastModification.dose_units}`
            : '',
          instructions: lastModification
            ? `${lastModification.frecuency}, durante ${lastModification.duration} ${lastModification.duration_units}`
            : '',
          active: med.active,
        };
      });

      // Get future medical events (upcoming appointments)
      const futureMedicalEvents = await this.prisma.appointment.findMany({
        where: {
          patient_id: id,
          tenant_id,
          status: {
            in: ['pendiente'],
          },
          deleted: false,
        },
        orderBy: {
          start: 'asc',
        },
        include: {
          physician: true,
        },
      });

      // Get past medical events (past appointments)
      const pastMedicalEvents = await this.prisma.appointment.findMany({
        where: {
          patient_id: id,
          tenant_id,
          start: {
            lt: new Date(),
          },
          status: {
            in: ['atendida', 'cancelada'],
          },
          deleted: false,
        },
        orderBy: {
          start: 'desc',
        },
        include: {
          physician: true,
        },
      });

      // Format evaluation from latest medical event
      const evaluation = latestMedicalEvent
        ? {
            id: latestMedicalEvent.id,
            details: latestMedicalEvent.physician_comments || '',
            date: latestMedicalEvent.created_at,
          }
        : null;

      // Format background
      const backgroundData = background
        ? {
            id: background.id,
            details: `
          Vacunas: ${background.vaccinations || ''}
          Alergias: ${background.allergies || ''}
          Antecedentes patológicos: ${background.pathological_history || ''}
          Antecedentes familiares: ${background.family_medical_history || ''}
          Antecedentes no patológicos: ${background.non_pathological_history || ''}
          Antecedentes quirúrgicos: ${background.surgical_history || ''}
          Antecedentes de infancia: ${background.childhood_medical_history || ''}
          Medicación actual: ${background.current_medication || ''}
        `,
            date: background.created_at,
          }
        : null;

      // Format medical events
      const formatMedicalEvents = (events) =>
        events.map((event) => {
          // Extract time from date or use a default time
          const date = new Date(event.start);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const timeStr = `${hours}:${minutes}`;

          return {
            id: event.id,
            date: date,
            time: timeStr,
            doctor: `${event.physician.name || ''} ${event.physician.last_name || ''}`,
            reason: event.consultation_reason || '',
            status: event.status,
          };
        });

      const user = patient.user;

      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name || '',
        image: user.image,
        birth_date: user.birth_date,
        email: user.email,
        notes: patient.notes || '',
        vital_signs: vitalSignsData,
        files: formattedFiles,
        evaluation: evaluation,
        background: backgroundData,
        current_medication: formattedMedications,
        future_medical_events: formatMedicalEvents(futureMedicalEvents),
        past_medical_events: formatMedicalEvents(pastMedicalEvents),
      };
    } catch (error) {
      console.error('Error en findOne:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error al obtener el paciente: ' + error.message,
      );
    }
  }

  async update(id: string, updatePatientDto: MedicalPatientDto) {
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

      await this.prisma.user.update({
        where: { id },
        data: {
          ...updatePatientDto.user,
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado en este tenant');
      }

      await this.prisma.patient.update({
        where: { user_id: id },
        data: {
          ...updatePatientDto.patient,
        },
      });

      return { message: 'Paciente actualizado correctamente' };
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
