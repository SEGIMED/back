import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { subscription_status_type } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsString()
  tenant_id: string;

  @IsString()
  user_id: string;

  @IsEnum(subscription_status_type)
  status: subscription_status_type;

  @IsString()
  type: string;

  @IsDate()
  start_date: Date;

  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsDate()
  last_payment_date?: Date;

  @IsOptional()
  @IsString()
  payment_method?: string;
}
