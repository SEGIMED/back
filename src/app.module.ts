import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TenantModule } from './tenant/tenant.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/typeorm'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
config({ path: '.env' });
import { PayPalModule } from './suscription/paypal/paypal.module';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AppointmentsModule, 
    MedicalEventsModule, 
    PrismaModule,
    UserModule, 
    TenantModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('typeorm')
    }),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: {
        expiresIn: "1h"
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService, PayPalModule, PrismaModule],
})
export class AppModule {}
