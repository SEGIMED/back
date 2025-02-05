import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from 'src/utils/auth.helper';
import { EmailService } from 'src/services/email/email.service';
import { recoverPasswordHtml } from 'src/services/email/templates/recoverPasswordHtml';
import { Request } from 'express';
/* import { MedicalPatientDto } from './dto/medical-patient.dto';
 */
@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(medicalPatientDto: any, req: Request): Promise<object> {
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
        return await this.prisma.$transaction(async (transaction) => {
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
          const jwtPayload = {
            email: user.email,
          };
          const passwordToken = AuthHelper.generateToken(jwtPayload, '1d');
          await transaction.password_reset.create({
            data: {
              email: user.email,
              token: passwordToken,
            },
          });
          const origin =
            req.headers.origin || req.protocol + '://' + req.headers.host;

          const resetUrl = `${origin}/reset-password?token=${passwordToken}`;
          this.emailService.sendMail(
            user.email,
            recoverPasswordHtml(resetUrl),
            'Recuperar contraseña',
          );
          return { message: 'Paciente creado exitosamente' };
        });
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al crear el paciente');
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
