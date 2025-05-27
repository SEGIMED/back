import { Module } from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { MedicalOrderController } from './medical_order.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/services/email/email.service';
import { TwilioService } from 'src/services/twilio/twilio.service';
import { PermissionCheckerService } from 'src/auth/permissions/permission-checker.service';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service';
import { FileUploadRepository } from 'src/utils/file_upload/file_upload.repository';
import { CloudinaryConfig } from 'src/utils/cloudinary';
import { PrescriptionModule } from 'src/medical-scheduling/modules/prescription/prescription.module';

@Module({
  imports: [PrescriptionModule],
  controllers: [MedicalOrderController],
  providers: [
    MedicalOrderService,
    PrismaService,
    EmailService,
    TwilioService,
    PermissionCheckerService,
    FileUploadService,
    FileUploadRepository,
    CloudinaryConfig,
  ],
})
export class MedicalOrderModule {}
