import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file_upload.service';
import { ApiTags } from '@nestjs/swagger';
import { Multer } from 'multer';

@Controller('files')
@ApiTags('Upload File')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF, 5MB para imágenes
            message: 'File exceeds the maximum size of 10MB for PDFs or 5MB for images',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg)|application\/pdf)$/i
          }),
        ],
      })
    ) file: Multer.File
  ) {
    try {
      const result = await this.fileUploadService.uploadFile(file);
      return result;  // Retorna la URL y el tipo
    } catch (error) {
      throw new Error('File upload failed: ' + error.message);  // Maneja errores aquí
    }
  }
}
