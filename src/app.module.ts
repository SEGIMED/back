import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './management/user/user.module';
import { AuthModule } from './management/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AppointmentsModule } from './medical-scheduling/appointments/appointments.module';
import { MedicalEventsModule } from './medical-scheduling/medical-events/medical-events.module';
import { PhysicalExaminationService } from './medical-scheduling/modules/physical-examination-data/physical-examination/physical-examination.service';
import { PhysicalSubsystemService } from './medical-scheduling/modules/physical-examination-data/physical_subsystem/physical_subsystem.service';
import { PatientModule } from './management/patient/patient.module';
import { PatientStudiesModule } from './medical-scheduling/modules/patient-studies/patient-studies.module';
import { FileUploadModule } from './utils/file_upload/file_upload.module';
import { CatStudyTypeModule } from './catalogs/cat-study-type/cat-study-type.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './services/email/email.module';
import { TwilioModule } from './services/twilio/twilio.module';
import { BackgroundModule } from './medical-scheduling/modules/background/background.module';
import { PhysicalExplorationModule } from './medical-scheduling/modules/physical-exploration-data/physical-exploration/physical-exploration.module';
import { PhysicalExplorationAreaModule } from './medical-scheduling/modules/physical-exploration-data/physical-exploration-area/physical-exploration-area.module';
import { CatCieDiezModule } from './catalogs/cat-cie-diez/cat-cie-diez.module';
import { SubcatCieDiezModule } from './catalogs/subcat-cie-diez/subcat-cie-diez.module';
import { MedicineModule } from './medical-scheduling/modules/medicine/medicine.module';
import { PrescriptionModule } from './medical-scheduling/modules/prescription/prescription.module';
import { PresModHistoryModule } from './medical-scheduling/modules/pres_mod_history/pres_mod_history.module';
import { TenantMiddleware } from './utils/middlewares/tenantMiddleware';
import { TenantExtractorMiddleware } from './auth/middlewares/tenant-extractor.middleware';
import { JwtUserExtractorMiddleware } from './auth/middlewares/jwt-user-extractor.middleware';
import { CatVitalSignsModule } from './catalogs/cat-vital-signs/cat-vital-signs.module';
import { CatMeasureUnitModule } from './catalogs/cat-measure-unit/cat-measure-unit.module';
import { GuardAuthModule } from './auth/guard-auth.module';
import { VitalSignsModule } from './medical-scheduling/modules/vital-signs/vital-signs.module';
import { MobileFunctionsModule } from './mobile-functions/mobile-functions.module';
import { CatalogSeedModule } from './catalogs/seed/catalog-seed.module';

config({ path: '.env' });

@Module({
  imports: [
    GuardAuthModule,
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
    CatCieDiezModule,
    SubcatCieDiezModule,
    CatVitalSignsModule,
    CatMeasureUnitModule,
    CatalogSeedModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: {
        expiresIn: '7h',
      },
    }),
    PatientModule,
    EmailModule,
    TwilioModule,
    MedicineModule,
    PrescriptionModule,
    PresModHistoryModule,
    BackgroundModule,
    PhysicalExplorationModule,
    PhysicalExplorationAreaModule,
    VitalSignsModule,
    MobileFunctionsModule,
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
        { path: 'auth/create-superadmin', method: RequestMethod.POST },
      )
      .forRoutes('*');

    consumer
      .apply(JwtUserExtractorMiddleware)
      .exclude({ path: 'auth/create-superadmin', method: RequestMethod.POST })
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(TenantExtractorMiddleware)
      .exclude({ path: 'auth/create-superadmin', method: RequestMethod.POST })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
