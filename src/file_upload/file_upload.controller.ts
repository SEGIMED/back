import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file_upload.service';
import { ApiTags } from '@nestjs/swagger';
import { Multer } from 'multer';

@Controller('files')
@ApiTags('Upload File')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024, // 5MB
            message: 'Image exceeds the maximum size of 5MB',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg))$/,
          }),
        ],
      })
    ) file: Multer.File
  ) {
    try {
      const result = await this.fileUploadService.uploadImage(file);
      return result;  // Retorna la URL y el tipo
    } catch (error) {
      throw new Error('File upload failed: ' + error.message);  // Maneja errores aquí
    }
  }

  @Post('upload/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF
            message: 'PDF exceeds the maximum size of 10MB',
          }),
          new FileTypeValidator({
            fileType: /^application\/pdf$/,
          }),
        ],
      })
    ) file: Multer.File
  ) {
    try {
      const result = await this.fileUploadService.uploadDocument(file);
      return result;  // Retorna la URL y el tipo
    } catch (error) {
      throw new Error('File upload failed: ' + error.message);  // Maneja errores aquí
    }
  }
}
