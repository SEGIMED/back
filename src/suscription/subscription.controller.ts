import { Controller, Post, Body, Patch, Param, Get, NotFoundException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create_subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    const { approvalUrl, subscription } =
      await this.subscriptionService.createSubscription(createSubscriptionDto);
    return { message: 'Subscription created', approvalUrl, subscription };
  }

  @Patch(':paymentId/status')
  async updateStatus(
    @Param('paymentId') paymentId: string,
    @Body('status') status: string,
  ) {
    const updated = await this.subscriptionService.updateSubscriptionStatus(
      paymentId,
      status,
    );
    return { message: 'Subscription status updated', updated };
  }

  @Get(':id')
async getSubscriptionById(@Param('id') id: string) {
  const subscription = await this.subscriptionService.getById(id);
  if (!subscription) {
    throw new NotFoundException(`Subscription with ID ${id} not found`);
  }
  return subscription;
}

@Get()
async getAllSubscriptions() {
  return this.subscriptionService.getAll();
}
}
