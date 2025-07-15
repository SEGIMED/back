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
import { calculateAge } from 'src/utils/fuctions';
import { EmergencyContactService } from '../emergency-contact/emergency-contact.service';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly userRoleManager: UserRoleManagerService,
    private readonly emergencyContactService: EmergencyContactService,
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

      // Determinar escenario y ejecutar lógica correspondiente
      if (
        existingUser &&
        existingUser.patient &&
        existingUser.patient.patient_tenant &&
        existingUser.patient.patient_tenant.length > 0
      ) {
        // Caso 1: Usuario existe y ya está asociado a este tenant -> Error
        throw new BadRequestException(
          'El usuario ya existe para esta organización',
        );
      } else if (existingUser && existingUser.patient) {
        // Caso 2: Usuario existe como paciente pero no asociado a este tenant -> Asociar
        return await this._handleExistingPatientInTenant(
          existingUser,
          tenant_id,
        );
      } else if (existingUser && !existingUser.patient) {
        // Caso 3: Usuario existe pero no es paciente -> Convertir
        return await this._convertExistingUserToPatient(
          existingUser,
          patient,
          tenant_id,
        );
      } else {
        // Caso 4: Usuario no existe -> Crear nuevo
        return await this._createNewUserAndPatient(
          user,
          patient,
          tenant_id,
          newPassword,
        );
      }
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

  private async _handleExistingPatientInTenant(
    existingUser: any,
    tenant_id: string,
  ): Promise<object> {
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
    });

    // Asignar el rol de paciente para este tenant
    await this.userRoleManager.assignDefaultRoleToUser(
      existingUser.id,
      'patient',
      tenant_id,
    );

    return {
      message: 'Paciente asociado exitosamente a la organización',
      userId: existingUser.id,
      action: 'associated',
    };
  }

  private async _convertExistingUserToPatient(
    existingUser: any,
    patientData: any,
    tenant_id: string,
  ): Promise<object> {
    console.log(
      `🔄 Usuario existente encontrado pero no es paciente: ${existingUser.email}. Creando registro de paciente.`,
    );

    let patientId: string;
    await this.prisma.$transaction(async (transaction) => {
      // Crear el registro de paciente
      const newPatient = await transaction.patient.create({
        data: {
          ...patientData,
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

  private async _createNewUserAndPatient(
    userData: any,
    patientData: any,
    tenant_id: string,
    newPassword: string,
  ): Promise<object> {
    console.log(
      `➕ Usuario nuevo: ${userData.email}. Creando usuario y paciente desde cero.`,
    );

    let newUserId: string;
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
    );

    // Pre-hash the password outside the transaction to avoid CPU-intensive operations within the transaction
    const hashedPassword = await AuthHelper.hashPassword(
      newPassword,
      saltRounds,
    );

    await this.prisma.$transaction(async (transaction) => {
      const newUser = await transaction.user.create({
        data: {
          ...userData,
          role: 'patient',
          password: hashedPassword,
        },
      });

      newUserId = newUser.id;

      const newPatient = await transaction.patient.create({
        data: {
          ...patientData,
          user_id: newUser.id,
        },
      });

      await transaction.patient_tenant.create({
        data: {
          patient_id: newPatient.id,
          tenant_id: tenant_id,
        },
      });
    });

    // Asignar el rol de paciente para este tenant
    await this.userRoleManager.assignDefaultRoleToUser(
      newUserId,
      'patient',
      tenant_id,
    );

    // Enviar credenciales por email para usuarios nuevos
    await this.emailService.sendMail(
      userData.email,
      'Credenciales Segimed',
      sendCredentialsHtml(userData.email, newPassword),
    );

    return {
      message: 'Paciente creado exitosamente',
      userId: newUserId,
      action: 'created',
    };
  }

  async findAll(
    pagination: PaginationParams,
    searchQuery?: string,
  ): Promise<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    data: GetPatientsDto[];
  }> {
    try {
      const { skip, take, orderBy, orderDirection } =
        parsePaginationAndSorting(pagination);

      const page = pagination.page ? parseInt(String(pagination.page), 10) : 1;

      const tenant_id = global.tenant_id;

      if (!tenant_id) {
        throw new BadRequestException('No se ha especificado un tenant válido');
      }

      let searchFilter: Prisma.patientWhereInput = {};
      if (searchQuery) {
        searchFilter = {
          OR: [
            { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
            {
              user: {
                last_name: { contains: searchQuery, mode: 'insensitive' },
              },
            },
            {
              user: {
                identification_number: {
                  contains: searchQuery,
                  mode: 'insensitive',
                },
              },
            },
            {
              health_care_number: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      const where: Prisma.patientWhereInput = {
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
      };

      const [patients, totalItems] = await this.prisma.$transaction([
        this.prisma.patient.findMany({
          where,
          include: {
            emergency_contact: true,
            user: {
              include: {
                identification_type: true,
                medical_event_patient: {
                  select: {
                    main_diagnostic_cie: true,
                  },
                  where: {
                    deleted: false,
                    appointment: {
                      status: 'atendida',
                    },
                  },
                  orderBy: {
                    updated_at: 'desc',
                  },
                  take: 1,
                },
              },
            },
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
        }),
        this.prisma.patient.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(totalItems / take);

      const data = patients.map((patient) => {
        const user = patient.user;
        return {
          id: user.id,
          name: user.name,
          last_name: user.last_name || '',
          image: user.image,
          age: calculateAge(user.birth_date),
          gender: user.gender || '',
          email: user.email,
          phone: user.phone || '',
          prefix: user.phone_prefix || '',
          identification_number: user.identification_number || '',
          identification_type: user.identification_type?.name || '',
          health_care_number: patient.health_care_number || '',
          main_diagnostic_cie:
            user.medical_event_patient[0]?.main_diagnostic_cie.description ||
            '',
          emergency_contact: patient.emergency_contact || null,
        };
      });

      return {
        currentPage: page,
        totalPages,
        totalItems,
        data,
      };
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

      // Obtener tenant IDs del paciente
      const patientTenants = await this.prisma.patient_tenant.findMany({
        where: {
          patient: {
            user_id: id,
          },
          deleted: false,
        },
        select: { tenant_id: true },
      });

      const tenantIds = patientTenants.map((pt) => pt.tenant_id);

      // Si no hay organizaciones asociadas, incluir el tenant actual como fallback
      if (!tenantIds.includes(tenant_id)) {
        tenantIds.push(tenant_id);
      }

      // Ejecutar todas las queries independientes en paralelo
      const [
        files,
        latestMedicalEvent,
        latestSelfEvaluation,
        background,
        medications,
        futureMedicalEvents,
        pastMedicalEvents,
      ] = await Promise.all([
        // Get patient files (studies) - Multitenant support
        this.prisma.patient_study.findMany({
          where: {
            patient_id: id,
            tenant_id: { in: tenantIds }, // Buscar en todas las organizaciones del paciente
            is_deleted: false,
          },
          select: {
            id: true,
            title: true,
            url: true,
          },
        }),

        // Get the latest medical event with status COMPLETED
        this.prisma.medical_event.findFirst({
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
        }),

        // Get the latest self evaluation
        this.prisma.self_evaluation_event.findFirst({
          where: {
            patient_id: id,
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
        }),

        // Get the latest patient background
        this.prisma.background.findFirst({
          where: {
            patient_id: id,
            tenant_id,
          },
          orderBy: {
            created_at: 'desc',
          },
        }),

        // Get active medications
        this.prisma.prescription.findMany({
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
        }),

        // Get future medical events (upcoming appointments)
        this.prisma.appointment.findMany({
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
        }),

        // Get past medical events (past appointments)
        this.prisma.appointment.findMany({
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
        }),
      ]);

      const formattedFiles = files.map((file) => ({
        id: file.id,
        name: file.title,
        url: file.url || '',
      }));

      // Determine which vital signs to use based on business logic:
      // 1. Priorizar medical events atendidos que tengan signos vitales guardados
      // 2. Si no, usar el dato de signo vital más reciente independientemente de la fuente
      let vitalSignsData = [];
      let vitalSignsSource = null;

      // Verificar si el latest medical event tiene signos vitales y está atendido
      const medicalEventHasVitalSigns =
        latestMedicalEvent &&
        latestMedicalEvent.vital_signs &&
        latestMedicalEvent.vital_signs.length > 0;

      if (medicalEventHasVitalSigns) {
        // Priorizar el medical event atendido con signos vitales
        vitalSignsSource = latestMedicalEvent;
      } else if (latestMedicalEvent && latestSelfEvaluation) {
        // Si el medical event no tiene signos vitales, comparar fechas
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
        // Paso 1: Extraer IDs de Signos Vitales únicos
        const vitalSignIds: number[] = [];
        const seenIds = new Set<number>();

        vitalSignsSource.vital_signs.forEach((vs) => {
          if (
            vs.vital_sign_id != null &&
            typeof vs.vital_sign_id === 'number' &&
            !seenIds.has(vs.vital_sign_id)
          ) {
            vitalSignIds.push(vs.vital_sign_id);
            seenIds.add(vs.vital_sign_id);
          }
        });

        // Paso 2: Query única para Unidades de Medida
        const measureUnitsMap = new Map<number, string>();
        if (vitalSignIds.length > 0) {
          const measureUnits = await this.prisma.cat_measure_unit.findMany({
            where: {
              cat_vital_signs: {
                some: {
                  id: { in: vitalSignIds },
                },
              },
            },
            include: {
              cat_vital_signs: {
                where: {
                  id: { in: vitalSignIds },
                },
                select: {
                  id: true,
                },
              },
            },
          });

          // Paso 3: Crear mapa para búsqueda rápida
          measureUnits.forEach((measureUnit) => {
            measureUnit.cat_vital_signs.forEach((vitalSign) => {
              measureUnitsMap.set(vitalSign.id, measureUnit.name);
            });
          });
        }

        // Paso 4: Modificar el mapeo original (ya no asíncrono)
        vitalSignsData = vitalSignsSource.vital_signs
          .map((vs) => {
            if (!vs.vital_sign) return null;

            const measureUnitName = measureUnitsMap.get(vs.vital_sign_id) || '';

            return {
              id: vs.id,
              vital_sign_category: vs.vital_sign.name,
              measure: vs.measure,
              vital_sign_measure_unit: measureUnitName,
            };
          })
          .filter((item) => item !== null);
      }

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
        age: calculateAge(user.birth_date),
        birth_date: user.birth_date,
        email: user.email,
        notes: patient.notes || '',
        vital_signs: vitalSignsData,
        files: formattedFiles,
        evaluation: evaluation,
        background: backgroundData,
        current_medication: medications.map((med) => {
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
        }),
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

  /**
   * Obtiene los tenant IDs del paciente de forma optimizada
   */
  private async getPatientTenantIds(
    patientId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<string[]> {
    // Si los tenants vienen del JWT, usarlos directamente
    if (userTenants && userTenants.length > 0) {
      return userTenants.map((tenant) => tenant.id);
    }

    // Sino, buscar en la DB con el patient_id directamente
    const patientTenants = await this.prisma.patient_tenant.findMany({
      where: {
        patient: {
          user_id: patientId,
        },
        deleted: false,
      },
      select: { tenant_id: true },
    });
    return patientTenants.map((pt) => pt.tenant_id);
  }

  /**
   * Obtiene el perfil completo del paciente autenticado usando su ID
   * Implementa soporte multitenant para acceder a datos de todas las organizaciones del paciente
   */
  async findMyProfile(
    userId: string,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<GetPatientDto> {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(userId, userTenants);

      if (tenantIds.length === 0) {
        throw new NotFoundException(
          'No se encontraron organizaciones asociadas al paciente',
        );
      }

      // Buscar el paciente usando el user_id
      const patient = await this.prisma.patient.findFirst({
        where: {
          user_id: userId,
          patient_tenant: {
            some: {
              tenant_id: { in: tenantIds },
              deleted: false,
            },
          },
        },
        include: {
          user: true,
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Ejecutar todas las queries independientes en paralelo con soporte multitenant
      const [
        files,
        latestMedicalEvent,
        latestSelfEvaluation,
        background,
        medications,
        futureMedicalEvents,
        pastMedicalEvents,
      ] = await Promise.all([
        // Get patient files (studies) - Multitenant support
        this.prisma.patient_study.findMany({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds }, // Buscar en todas las organizaciones del paciente
            is_deleted: false,
          },
          select: {
            id: true,
            title: true,
            url: true,
          },
        }),

        // Get the latest medical event with status COMPLETED - Multitenant support
        this.prisma.medical_event.findFirst({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds },
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
        }),

        // Get the latest self evaluation
        this.prisma.self_evaluation_event.findFirst({
          where: {
            patient_id: userId,
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
        }),

        // Get the latest patient background - Multitenant support
        this.prisma.background.findFirst({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds },
          },
          orderBy: {
            created_at: 'desc',
          },
        }),

        // Get active medications - Multitenant support
        this.prisma.prescription.findMany({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds },
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
        }),

        // Get future medical events (upcoming appointments) - Multitenant support
        this.prisma.appointment.findMany({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds },
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
        }),

        // Get past medical events (past appointments) - Multitenant support
        this.prisma.appointment.findMany({
          where: {
            patient_id: userId,
            tenant_id: { in: tenantIds },
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
        }),
      ]);

      const formattedFiles = files.map((file) => ({
        id: file.id,
        name: file.title,
        url: file.url || '',
      }));

      // Determine which vital signs to use based on business logic:
      // 1. Priorizar medical events atendidos que tengan signos vitales guardados
      // 2. Si no, usar el dato de signo vital más reciente independientemente de la fuente
      let vitalSignsData = [];
      let vitalSignsSource = null;

      // Verificar si el latest medical event tiene signos vitales y está atendido
      const medicalEventHasVitalSigns =
        latestMedicalEvent &&
        latestMedicalEvent.vital_signs &&
        latestMedicalEvent.vital_signs.length > 0;

      if (medicalEventHasVitalSigns) {
        // Priorizar el medical event atendido con signos vitales
        vitalSignsSource = latestMedicalEvent;
      } else if (latestMedicalEvent && latestSelfEvaluation) {
        // Si el medical event no tiene signos vitales, comparar fechas
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
        // Paso 1: Extraer IDs de Signos Vitales únicos
        const vitalSignIds: number[] = [];
        const seenIds = new Set<number>();

        vitalSignsSource.vital_signs.forEach((vs) => {
          if (
            vs.vital_sign_id != null &&
            typeof vs.vital_sign_id === 'number' &&
            !seenIds.has(vs.vital_sign_id)
          ) {
            vitalSignIds.push(vs.vital_sign_id);
            seenIds.add(vs.vital_sign_id);
          }
        });

        // Paso 2: Query única para Unidades de Medida
        const measureUnitsMap = new Map<number, string>();
        if (vitalSignIds.length > 0) {
          const measureUnits = await this.prisma.cat_measure_unit.findMany({
            where: {
              cat_vital_signs: {
                some: {
                  id: { in: vitalSignIds },
                },
              },
            },
            include: {
              cat_vital_signs: {
                where: {
                  id: { in: vitalSignIds },
                },
                select: {
                  id: true,
                },
              },
            },
          });

          // Paso 3: Crear mapa para búsqueda rápida
          measureUnits.forEach((measureUnit) => {
            measureUnit.cat_vital_signs.forEach((vitalSign) => {
              measureUnitsMap.set(vitalSign.id, measureUnit.name);
            });
          });
        }

        // Paso 4: Modificar el mapeo original (ya no asíncrono)
        vitalSignsData = vitalSignsSource.vital_signs
          .map((vs) => {
            if (!vs.vital_sign) return null;

            const measureUnitName = measureUnitsMap.get(vs.vital_sign_id) || '';

            return {
              id: vs.id,
              vital_sign_category: vs.vital_sign.name,
              measure: vs.measure,
              vital_sign_measure_unit: measureUnitName,
            };
          })
          .filter((item) => item !== null);
      }

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
        age: calculateAge(user.birth_date),
        birth_date: user.birth_date,
        email: user.email,
        notes: patient.notes || '',
        vital_signs: vitalSignsData,
        files: formattedFiles,
        evaluation: evaluation,
        background: backgroundData,
        current_medication: medications.map((med) => {
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
        }),
        future_medical_events: formatMedicalEvents(futureMedicalEvents),
        past_medical_events: formatMedicalEvents(pastMedicalEvents),
      };
    } catch (error) {
      console.error('Error en findMyProfile:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error al obtener el perfil del paciente: ' + error.message,
      );
    }
  }

  /**
   * Actualiza el perfil del paciente autenticado usando su ID
   * Implementa soporte multitenant para permitir actualización desde la app móvil
   */
  async updateMyProfile(
    userId: string,
    updateData: Partial<MedicalPatientDto>,
    userTenants?: { id: string; name: string; type: string }[],
  ): Promise<{ message: string }> {
    try {
      // Obtener tenant IDs del paciente
      const tenantIds = await this.getPatientTenantIds(userId, userTenants);

      if (tenantIds.length === 0) {
        throw new NotFoundException(
          'No se encontraron organizaciones asociadas al paciente',
        );
      }

      // Buscar el paciente usando el user_id con soporte multitenant
      const patient = await this.prisma.patient.findFirst({
        where: {
          user_id: userId,
          patient_tenant: {
            some: {
              tenant_id: { in: tenantIds },
              deleted: false,
            },
          },
        },
      });

      if (!patient) {
        throw new NotFoundException('Paciente no encontrado');
      }

      // Ejecutar actualizaciones en una transacción atómica
      await this.prisma.$transaction(async (transaction) => {
        // Actualizar datos del usuario si están presentes
        if (updateData.user) {
          await transaction.user.update({
            where: { id: userId },
            data: {
              ...updateData.user,
            },
          });
        }

        // Actualizar datos específicos del paciente si están presentes
        if (updateData.patient) {
          await transaction.patient.update({
            where: { user_id: userId },
            data: {
              ...updateData.patient,
            },
          });
        }
      });

      return { message: 'Perfil actualizado correctamente' };
    } catch (error) {
      console.error('Error en updateMyProfile:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error?.code === 'P2025') {
        throw new NotFoundException('Paciente no encontrado');
      }
      throw new BadRequestException(
        'Error al actualizar el perfil del paciente: ' + error.message,
      );
    }
  }
}
