import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
/* import { TenantModule } from './tenant/tenant.module'; */
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PatientModule } from './patient/patient.module';
config({ path: '.env' });

@Module({
  imports: [
    AppointmentsModule,
    MedicalEventsModule,
    UserModule,
    /*     TenantModule, */
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   load: [typeOrmConfig]
    // }),
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => configService.get('typeorm')
    // }),
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    PatientModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
