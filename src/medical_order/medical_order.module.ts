import { Module } from '@nestjs/common';
import { MedicalOrderService } from './medical_order.service';
import { MedicalOrderController } from './medical_order.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionCheckerService } from 'src/auth/permissions/permission-checker.service';
import { FileUploadService } from 'src/utils/file_upload/file_upload.service';
import { FileUploadRepository } from 'src/utils/file_upload/file_upload.repository';
import { CloudinaryConfig } from 'src/utils/cloudinary';
import { PrescriptionModule } from 'src/medical-scheduling/modules/prescription/prescription.module';
import { NotificationModule } from 'src/services/notification/notification.module';

@Module({
  imports: [PrescriptionModule, NotificationModule],
  controllers: [MedicalOrderController],
  providers: [
    MedicalOrderService,
    PrismaService,
    PermissionCheckerService,
    FileUploadService,
    FileUploadRepository,
    CloudinaryConfig,
  ],
})
export class MedicalOrderModule {}
