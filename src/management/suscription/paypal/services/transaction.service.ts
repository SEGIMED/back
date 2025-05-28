/* import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: {
    orderId: string;
    status: string;
    amount: number;
    currency: string;
    userId: string;
    tenant_id: string;
  }) {
    return this.prisma.transaction.create({ data });
  }

  async getTransactionsByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
    });
  }
}
 */
