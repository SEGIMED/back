import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './created_subscription.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}
