import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from 'src/utils/auth.helper';
import { CreateUserDto, GoogleUserDto } from 'src/user/dto/create-user.dto';
import { RequestPasswordDto } from './dto/password-auth.dto';
import { EmailService } from 'src/utils/email/email.service';
import { Request } from 'express';
import { recoverPasswordHtml } from 'src/utils/email/templates/recoverPasswordHtml';
import { ConfigService } from '@nestjs/config';
import welcomeEmailHtml from 'src/utils/email/templates/welcomeEmailHtml';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async create(data: CreateUserDto): Promise<object> {
    try {
      const saltRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      );
      data.password = await AuthHelper.hashPassword(data.password, saltRounds);

      await this.prisma.user.create({
        data: data,
      });

      const htmlContent = welcomeEmailHtml(data.name);
      await this.emailService.sendMail(
        data.email,
        htmlContent,
        'Bienvenido a Segimed',
      );
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'El correo electrónico ya está registrado.',
        );
      }
      console.log(error);
      throw new BadRequestException('No se pudo crear el usuario.');
    }

    return { message: 'El usuario se ha creado con éxito' };
  }
  async login(createAuthDto: CreateAuthDto): Promise<object> {
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
      const jwtPayload = {
        email: user.email,
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        tenant_id: user.tenant_id || '',
        role: user.role,
        image: user.image,
      };
      const jwt = AuthHelper.generateToken(jwtPayload);

      return { message: 'Login exitoso', jwt: jwt, user: jwtPayload };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al procesar la solicitud de login');
    }
  }

  async googleLogin(GoogleUserDto: GoogleUserDto): Promise<object> {
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
            tenant_id: '',
            password: '',
          },
        });
      }

      if (!user) {
        throw new Error('Error al crear el usuario o el usuario no existe');
      }

      const jwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        tenant_id: user.tenant_id,
        role: user.role,
      };
      const token = AuthHelper.generateToken(jwtPayload);

      return {
        message: 'Login exitoso',
        token: token,
        user: jwtPayload,
      };
    } catch (error) {
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
}
