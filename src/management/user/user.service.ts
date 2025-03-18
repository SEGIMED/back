import { BadRequestException, Injectable } from '@nestjs/common';
// import { Tenant } from 'src/tenant/entities/tenant.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingDto } from './dto/onboarding-user.dto';
import { UserRoleManagerService } from '../../auth/roles/user-role-manager.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRoleManager: UserRoleManagerService,
  ) {}

  async onboarding(onboardingDto: OnboardingDto): Promise<object> {
    try {
      const { speciality, user_id, ...rest } = onboardingDto;

      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new BadRequestException('El usuario no existe');
      }

      let tenantId: string;

      await this.prisma.$transaction(async (transaction) => {
        const newTenant = await transaction.tenant.create({
          data: {
            type: onboardingDto.type,
          },
        });

        tenantId = newTenant.id;

        const existingPhysician = await transaction.physician.findFirst({
          where: { user_id },
        });
        if (existingPhysician) {
          throw new BadRequestException('El usuario ya es un médico.');
        }

        const newPhysician = await transaction.physician.create({
          data: {
            user_id,
            tenant_id: newTenant.id,
          },
        });
        const newPhysicianSpeciality = speciality.map((speciality) => {
          return {
            physician_id: newPhysician.id,
            speciality_id: speciality,
          };
        });

        await transaction.physician_speciality.createMany({
          data: newPhysicianSpeciality,
          skipDuplicates: true,
        });

        await transaction.user.update({
          where: { id: user_id },
          data: {
            tenant_id: newTenant.id,
          },
        });

        const newOrganization = await transaction.organization.create({
          data: {
            tenant_id: newTenant.id,
            ...rest,
          },
        });

        await transaction.organization_physician.create({
          data: {
            physician_id: newPhysician.id,
            organization_id: newOrganization.id,
            tenant_id: newTenant.id,
          },
        });
      });

      // Asignar rol de Admin al médico
      await this.userRoleManager.assignDefaultRoleToUser(
        user_id,
        'physician',
        tenantId,
      );

      return { message: 'Onboarding completo.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
      throw new BadRequestException('No se pudo guardar la información.');
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
