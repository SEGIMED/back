import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from 'src/utils/auth.helper';
import { GoogleUserDto } from 'src/user/dto/create-user.dto';
import { RequestPasswordDto } from './dto/password-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
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
        tenant_id: user.tenant_id,
        role: user.role,
        image: user.image,
      };
      const jwt = await this.jwtService.signAsync(jwtPayload);

      return { message: 'Login exitoso', jwt: jwt, user: jwtPayload };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
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
      const token = await this.jwtService.signAsync(jwtPayload);

      return {
        message: 'Login exitoso',
        token: token,
        user: jwtPayload,
      };
    } catch {
      throw new Error('Error al procesar la solicitud de Google Login');
    }
  }

  async requestPasswordReset(
    RequestPasswordDto: RequestPasswordDto,
  ): Promise<object> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: RequestPasswordDto.email },
      });

      if (!user) {
        throw new BadRequestException('El email no está registrado');
      }

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
}
