import { BadRequestException, Injectable } from '@nestjs/common';
// import { Tenant } from 'src/tenant/entities/tenant.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthHelper } from 'src/utils/auth.helper';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/utils/email/email.service';
import welcomeEmailHtml from 'src/utils/email/templates/welcomeEmailHtml';

@Injectable()
export class UserService {
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
      throw new BadRequestException('No se pudo crear el usuario.');
    }

    return { message: 'El usuario se ha creado con éxito' };
  }

  /*   async onboarding(data: any) {} */

  async findAll(): Promise<any[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async findOneById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (user) {
        return { message: 'Success', user: user };
      } else {
        return { message: 'El usuario no existe' };
      }
    } catch (error) {
      return { message: 'Error en la consulta', Error: error };
    }
  }

  async findOneByEmail(email: string) {
    try {
      console.log(email);
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });
      if (user) {
        return { message: 'Success', user: user };
      } else {
        return { message: 'El usuario no existe' };
      }
    } catch (error) {
      return { message: 'Error en la consulta', Error: error };
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
