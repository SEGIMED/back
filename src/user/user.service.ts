import { Injectable } from '@nestjs/common';
// import { Tenant } from 'src/tenant/entities/tenant.entity';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    // @InjectRepository(User) private readonly userRepository: Repository<User>,
    // @InjectRepository(Tenant) private readonly tenantRepository: Repository<Tenant>
  ) {}
  async create(data: Prisma.userCreateInput): Promise<object> {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    const user = await this.prisma.user
      .create({
        data: data,
      })
      .catch((err) => {
        throw new Error(err);
      });
    return { message: 'El usuario se ha creado con éxito', user: user };
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
