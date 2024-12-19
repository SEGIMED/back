import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PayPalModule } from './suscription/paypal/paypal.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PayPalModule, PrismaModule],
})
export class AppModule {}
