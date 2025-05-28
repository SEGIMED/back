import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file_upload.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Multer } from 'multer';

@Controller('files')
@ApiTags('Upload File')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}
  @Post('upload')
  @ApiOperation({
    summary: 'Subir archivo',
    description: 'Permite subir un archivo (imagen o PDF) a Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (imagen o PDF)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL segura del archivo subido',
          example:
            'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
        },
        type: {
          type: 'string',
          description: 'Tipo de archivo (image o pdf)',
          example: 'image',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Archivo inválido o excede el tamaño máximo permitido',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error al subir el archivo',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10MB para PDF, 5MB para imágenes
            message:
              'File exceeds the maximum size of 10MB for PDFs or 5MB for images',
          }),
          new FileTypeValidator({
            fileType: /^(image\/(jpg|jpeg|png|webp|svg)|application\/pdf)$/i,
          }),
        ],
      }),
    )
    file: Multer.File,
  ) {
    try {
      const result = await this.fileUploadService.uploadFile(file);
      return result; // Retorna la URL y el tipo
    } catch (error) {
      throw new Error('File upload failed: ' + error.message); // Maneja errores aquí
    }
  }
}
