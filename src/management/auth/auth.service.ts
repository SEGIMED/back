import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from 'src/utils/auth.helper';
import {
  CreateUserDto,
  GoogleUserDto,
} from 'src/management/user/dto/create-user.dto';
import { RequestPasswordDto } from './dto/password-auth.dto';
import { EmailService } from 'src/services/email/email.service';
import { Request } from 'express';
import { recoverPasswordHtml } from 'src/services/email/templates/recoverPasswordHtml';
import { ConfigService } from '@nestjs/config';
import welcomeEmailHtml from 'src/services/email/templates/welcomeEmailHtml';
import { TwilioService } from 'src/services/twilio/twilio.service';
import {
  JwtPayloadDto,
  LoginResponseDto,
  TenantDto,
} from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly otpService: TwilioService,
  ) {}
  async create(data: CreateUserDto): Promise<object> {
    try {
      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      );
      data.password = await AuthHelper.hashPassword(data.password, saltRounds);

      const user = await this.prisma.user.create({
        data: data,
      });

      const htmlContent = welcomeEmailHtml(data.name);
      await this.emailService.sendMail(
        data.email,
        htmlContent,
        'Bienvenido a Segimed',
      );
      return {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'El correo electrónico ya está registrado.',
        );
      }
      console.log(error);
      throw new BadRequestException('No se pudo crear el usuario.');
    }
  }
  async login(createAuthDto: CreateAuthDto): Promise<LoginResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: createAuthDto.email },
      });

      if (!user) {
        throw new BadRequestException('El email no está registrado');
      }

      const isPasswordValid = await AuthHelper.comparePasswords(
        createAuthDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('La contraseña es incorrecta');
      }

      // Create the JWT payload
      const jwtPayload: JwtPayloadDto = {
        email: user.email,
        id: user.id,
        name: user.name,
        last_name: user.last_name || '',
        role: user.role,
        image: user.image,
      };

      // Check if the user is a patient
      if (user.role === 'patient') {
        // Get the associated patient record
        const patient = await this.prisma.patient.findUnique({
          where: { user_id: user.id },
        });

        if (patient) {
          // Get all tenants associated with this patient
          const patientTenants = await this.prisma.patient_tenant.findMany({
            where: {
              patient_id: patient.id,
              deleted: false,
            },
            include: {
              tenant: {
                include: {
                  organizations: true,
                },
              },
            },
          });

          // Format tenant information
          if (patientTenants.length > 0) {
            const tenants: TenantDto[] = patientTenants.map((pt) => ({
              id: pt.tenant_id,
              name:
                pt.tenant.organizations.length > 0
                  ? pt.tenant.organizations[0].name
                  : 'Organización',
              type: pt.tenant.type,
            }));

            // Add tenants to the JWT payload
            jwtPayload.tenants = tenants;
          }
        }
      } else {
        // For non-patient users, just add the tenant_id as before
        jwtPayload.tenant_id = user.tenant_id || '';
      }

      const jwt = AuthHelper.generateToken(jwtPayload);

      return {
        message: 'Login exitoso',
        jwt: jwt,
        user: jwtPayload,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al procesar la solicitud de login');
    }
  }

  async googleLogin(GoogleUserDto: GoogleUserDto): Promise<LoginResponseDto> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: GoogleUserDto.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: GoogleUserDto.email,
            name: GoogleUserDto.name ?? '',
            image: GoogleUserDto.image ?? '',
            tenant_id: null,
            password: '',
            marital_status: 'soltero',
          },
        });
      }

      if (!user) {
        throw new Error('Error al crear el usuario o el usuario no existe');
      }

      // Create the JWT payload
      const jwtPayload: JwtPayloadDto = {
        email: user.email,
        id: user.id,
        name: user.name,
        last_name: user.last_name || '',
        role: user.role,
        image: user.image,
      };

      // Check if the user is a patient
      if (user.role === 'patient') {
        // Get the associated patient record
        const patient = await this.prisma.patient.findUnique({
          where: { user_id: user.id },
        });

        if (patient) {
          // Get all tenants associated with this patient
          const patientTenants = await this.prisma.patient_tenant.findMany({
            where: {
              patient_id: patient.id,
              deleted: false,
            },
            include: {
              tenant: {
                include: {
                  organizations: true,
                },
              },
            },
          });

          // Format tenant information
          if (patientTenants.length > 0) {
            const tenants: TenantDto[] = patientTenants.map((pt) => ({
              id: pt.tenant_id,
              name:
                pt.tenant.organizations.length > 0
                  ? pt.tenant.organizations[0].name
                  : 'Organización',
              type: pt.tenant.type,
            }));

            // Add tenants to the JWT payload
            jwtPayload.tenants = tenants;
          }
        }
      } else {
        // For non-patient users, just add the tenant_id as before
        jwtPayload.tenant_id = user.tenant_id || '';
      }

      const jwt = AuthHelper.generateToken(jwtPayload);

      return {
        message: 'Login exitoso',
        jwt: jwt,
        user: jwtPayload,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al procesar la solicitud de Google Login');
    }
  }

  async requestPasswordReset(
    RequestPasswordDto: RequestPasswordDto,
    req: Request,
  ): Promise<object> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: RequestPasswordDto.email },
      });

      if (!user) {
        throw new BadRequestException('El email no está registrado');
      }
      const origin =
        req.headers.origin || req.protocol + '://' + req.headers.host;

      const jwtPayload = {
        email: user.email,
      };

      const token = AuthHelper.generateToken(jwtPayload, '1h');

      await this.prisma.password_reset.create({
        data: {
          email: user.email,
          token: token,
        },
      });

      const resetUrl = `${origin}/reset-password?token=${token}`;

      this.emailService.sendMail(
        RequestPasswordDto.email,
        recoverPasswordHtml(resetUrl),
        'Recuperar contraseña',
      );

      return {
        message:
          'Se ha enviado un correo electrónico para restablecer la contraseña',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(
        'Error al procesar la solicitud de restablecimiento de contraseña',
      );
    }
  }

  async resetPassword(token: string, password: string): Promise<object> {
    try {
      const jwtVerification = AuthHelper.verifyToken(token);
      if (!jwtVerification || typeof jwtVerification === 'string') {
        throw new BadRequestException('El token no es válido');
      }
      const validToken = await this.prisma.password_reset.findUnique({
        where: { token: token, email: jwtVerification.email },
      });
      if (!validToken) {
        throw new BadRequestException('El token no es válido');
      }
      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      );
      const hashPassword = await AuthHelper.hashPassword(password, saltRounds);
      await this.prisma.user.update({
        where: { email: jwtVerification.email },
        data: { password: hashPassword },
      });
      return { message: 'Contraseña restablecida con éxito.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('El token no es válido o ha expirado.');
    }
  }

  async sendVerificationCodePhone(
    user_id: string,
    phone_prefix: string,
    phone: string,
  ): Promise<object> {
    try {
      const verification_code = this.otpService.generateOtp();
      const phoneNumber = phone_prefix + phone;
      const code_expires_at = new Date(Date.now() + 5 * 60 * 1000);

      await this.prisma.$transaction(async (transaction) => {
        await transaction.otp_code.upsert({
          where: { id: user_id },
          create: {
            id: user_id,
            code: verification_code,
            code_expires_at: code_expires_at,
          },
          update: {
            code: verification_code,
            code_expires_at: code_expires_at,
          },
        });

        await transaction.user.update({
          where: { id: user_id },
          data: {
            phone_prefix,
            phone,
          },
        });

        await this.otpService.sendOtp(phoneNumber, verification_code);
      });

      return { message: 'Código de verificación enviado.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
      throw new BadRequestException(
        'Error al enviar el código de verificación.',
      );
    }
  }

  async verifyPhoneCode(user_id: string, code: string): Promise<object> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });
      const otp_exists = await this.prisma.otp_code.findUnique({
        where: {
          id: user_id,
        },
      });
      if (!user) {
        throw new BadRequestException('El usuario no existe');
      }
      if (!otp_exists) {
        throw new BadRequestException(
          'El usuario no tiene un código de verificación',
        );
      }
      if (otp_exists.code !== code) {
        throw new BadRequestException(
          'El código de verificación es incorrecto',
        );
      }
      if (otp_exists.code_expires_at < new Date()) {
        throw new BadRequestException('El código de verificación ha expirado');
      }
      await this.prisma.user.update({
        where: { id: user_id },
        data: {
          is_phone_verified: true,
        },
      });
      return {
        message: 'Número de teléfono verificado.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
      throw new BadRequestException(
        'Error al verificar el código de verificación.',
      );
    }
  }

  async createSuperAdmin(createSuperAdminDto: any): Promise<object> {
    try {
      const expectedSecretKey = this.configService.get<string>(
        'SUPER_ADMIN_SECRET_KEY',
      );
      if (!expectedSecretKey) {
        throw new BadRequestException(
          'La clave secreta no está configurada en el servidor',
        );
      }

      const superAdminTenantId = this.configService.get<string>(
        'SUPER_ADMIN_TENANT_ID',
      );
      if (!superAdminTenantId) {
        throw new BadRequestException(
          'El ID del tenant del superadmin no está configurado en el servidor',
        );
      }

      if (createSuperAdminDto.secret_key !== expectedSecretKey) {
        throw new BadRequestException('Clave secreta incorrecta');
      }

      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      );
      const hashedPassword = await AuthHelper.hashPassword(
        createSuperAdminDto.password,
        saltRounds,
      );

      const user = await this.prisma.user.create({
        data: {
          name: createSuperAdminDto.name,
          last_name: createSuperAdminDto.last_name,
          email: createSuperAdminDto.email,
          password: hashedPassword,
          role: 'superadmin',
          tenant_id: superAdminTenantId,
          is_superadmin: true,
          marital_status: 'soltero',
        },
      });

      await this.setupSuperAdminRolesAndPermissions(
        user.id,
        createSuperAdminDto.tenant_id,
      );

      return {
        message: 'Superadmin creado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          last_name: user.last_name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear el superadmin: ${error.message}`,
      );
    }
  }

  private async setupSuperAdminRolesAndPermissions(
    userId: string,
    tenantId?: string,
  ): Promise<void> {
    try {
      let superadminRole = await this.prisma.role.findFirst({
        where: {
          name: 'superadmin',
          tenant_id: tenantId || null,
        },
      });

      if (!superadminRole) {
        superadminRole = await this.prisma.role.create({
          data: {
            name: 'superadmin',
            description: 'Administrador del sistema con acceso total',
            tenant_id: tenantId || null,
          },
        });
      }

      await this.prisma.user_role.create({
        data: {
          user_id: userId,
          role_id: superadminRole.id,
        },
      });

      const permissions = await this.prisma.permission.findMany();

      for (const permission of permissions) {
        const existingPermission = await this.prisma.role_permission.findFirst({
          where: {
            role_id: superadminRole.id,
            permission_id: permission.id,
          },
        });

        if (!existingPermission) {
          await this.prisma.role_permission.create({
            data: {
              role_id: superadminRole.id,
              permission_id: permission.id,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error al configurar roles y permisos:', error);
      throw new Error('Error al configurar roles y permisos de superadmin');
    }
  }
}
