/* import { Injectable } from '@nestjs/common';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Tenant } from './entities/tenant.interface';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Prisma.TenantCreateInput): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({ data });
    return tenant;
  }

  async findAll() {
    const tenants = await this.prisma.tenant.findMany();
    return tenants;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
 */
