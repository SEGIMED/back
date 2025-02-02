import { Injectable } from '@nestjs/common';
// import { Tenant } from 'src/tenant/entities/tenant.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingDto } from './dto/onboarding-user.dto';
import { tenant_type } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async onboarding(onboardingDto: OnboardingDto): Promise<object> {
    try {
      await this.prisma.organization.create({
        data: { type: onboardingDto.type as tenant_type, ...onboardingDto },
      });
      return { message: 'Onboarding exitoso.' };
    } catch (error) {
      console.log(error);
    }
  }

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
