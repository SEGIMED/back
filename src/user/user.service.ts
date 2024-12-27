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
  async create(data: Prisma.userCreateInput): Promise<any> {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    const user = await this.prisma.user.create({ data });
    return user;
  }

  async findAll(): Promise<any[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
