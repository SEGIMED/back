import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subscription.findMany({
      include: { user: true },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async create(data: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data,
    });
  }

  async update(id: string, data: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const subscription = await this.findOne(id);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
