import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PhysicalExaminationService } from './services/physical-examination/physical-examination.service';
import { PhysicalSubsystemService } from './services/physical_subsystem/physical_subsystem.service';
import { PatientModule } from './patient/patient.module';
import { PatientStudiesModule } from './patient-studies/patient-studies.module';
import { FileUploadModule } from './file_upload/file_upload.module';
import { CatStudyTypeModule } from './patient-studies/cat-study-type/cat-study-type.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './services/email/email.module';
import { TenantMiddleware } from './utils/middlewares/tenantMiddleware';
import { TwilioModule } from './services/twilio/twilio.module';
import { BackgroundModule } from './background/background.module';
import { PhysicalExplorationModule } from './physical-exploration-data/physical-exploration/physical-exploration.module';
import { PhysicalExplorationAreaModule } from './physical-exploration-data/physical-exploration-area/physical-exploration-area.module';
import { CatCieDiezModule } from './cat-cie-diez/cat-cie-diez.module';
import { SubcatCieDiezModule } from './subcat-cie-diez/subcat-cie-diez.module';

config({ path: '.env' });

@Module({
  imports: [
    AppointmentsModule,
    MedicalEventsModule,
    UserModule,
    PatientStudiesModule,
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que las configuraciones sean accesibles globalmente
      envFilePath: '.env', // El archivo de configuración (debería estar en la raíz)
    }),
    PrismaModule,
    AuthModule,
    FileUploadModule,
    CatStudyTypeModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    PatientModule,
    EmailModule,
    TwilioModule,
    BackgroundModule,
    PhysicalExplorationModule,
    PhysicalExplorationAreaModule,
    CatCieDiezModule,
    SubcatCieDiezModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    PhysicalExaminationService,
    PhysicalSubsystemService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/', method: RequestMethod.POST },
        { path: 'auth/google', method: RequestMethod.POST },
        { path: 'auth/request-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'auth/send-otp', method: RequestMethod.POST },
        { path: 'auth/verify-otp', method: RequestMethod.POST },
        { path: 'user/onboarding', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
