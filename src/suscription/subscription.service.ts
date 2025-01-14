import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';
import { v4 as uuidv4 } from 'uuid'; // Importar función para generar UUID

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    const subscriptionId = uuidv4(); // Generar UUID único
    const paymentId = uuidv4();
    
    // Asegurarse de que las fechas se convierten correctamente a formato ISO-8601
    const startDate = new Date(createSubscriptionDto.startDate + "T00:00:00Z"); // UTC
    const endDate = new Date(createSubscriptionDto.endDate + "T00:00:00Z"); // UTC
  
    const subscription = await this.prisma.subscription.create({
      data: {
        id: subscriptionId, // Asignar el UUID generado
        plan: createSubscriptionDto.plan,
        amount: createSubscriptionDto.amount,
        startDate: startDate,
        endDate: endDate,
        paymentId: paymentId, // Generar UUID para paymentId
        status: 'pending', // Estado inicial
      },
    });
  
    const approvalUrl = `https://sandbox.paypal.com/checkout?subscriptionId=${subscriptionId}`;
  
    return { approvalUrl, subscription };
  }

  async updateSubscriptionStatus(paymentId: string, status: string) {
    return this.prisma.subscription.update({
      where: { id: paymentId },
      data: { status },
    });
  }

  async getById(id: string) {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  async getAll() {
    return this.prisma.subscription.findMany();
  }
}