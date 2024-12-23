import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Post()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subscriptionService.remove(id);
  }
}
