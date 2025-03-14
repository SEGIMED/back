import { Module } from '@nestjs/common';
import { FileUploadController } from './file_upload.controller';
import { FileUploadService } from './file_upload.service';
import { CloudinaryConfig } from '../cloudinary';
import { FileUploadRepository } from './file_upload.repository';

@Module({
  imports: [],
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryConfig, FileUploadRepository],
})
export class FileUploadModule {}
