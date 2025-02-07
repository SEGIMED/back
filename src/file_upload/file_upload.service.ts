import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file_upload.repository';
import { Multer } from 'multer';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileUploadRepository: FileUploadRepository) {}

  async uploadImage(file: Multer.File): Promise<{ url: string; type: string }> {
    const isImage = file.mimetype.startsWith('image/');  // Verifica si es imagen
    if (isImage) {
      const response = await this.fileUploadRepository.uploadFile(file, true);
      return { url: response.url, type: 'image' };  // Asume 'image' para imágenes
    } else {
      throw new Error('Uploaded file is not an image');
    }
  }

  async uploadDocument(file: Multer.File): Promise<{ url: string; type: string }> {
    const isPdf = file.mimetype === 'application/pdf';  // Verifica si es un PDF
    if (isPdf) {
      const response = await this.fileUploadRepository.uploadFile(file, false);
      return { url: response.url, type: 'pdf' };  // Asume 'pdf' para archivos PDF
    } else {
      throw new Error('Uploaded file is not a PDF');
    }
  }
}
