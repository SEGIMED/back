import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file_upload.repository';
import { Multer } from 'multer';

@Injectable()
export class FileUploadService {
  constructor(private readonly fileUploadRepository: FileUploadRepository) {}

  async uploadFile(file: Multer.File): Promise<{ url: string; type: string }> {
    const result = await this.fileUploadRepository.uploadFile(file);

    return {
      url: result.secure_url,
      type: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
    };
  }

  /**
   * Sube un archivo a Cloudinary a partir de un DATA URI en base64
   * @param dataUri DATA URI en formato base64 (ej: data:application/pdf;base64,JVBERi0...)
   * @param filename Nombre del archivo (opcional)
   * @returns Objeto con la URL y el tipo de archivo
   */
  async uploadBase64File(
    dataUri: string,
    filename?: string,
  ): Promise<{ url: string; type: string }> {
    const result = await this.fileUploadRepository.uploadBase64File(
      dataUri,
      filename,
    );

    // Determinar el tipo de archivo a partir del DATA URI
    const mimeMatch = dataUri.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    return {
      url: result.secure_url,
      type: mimeType.startsWith('image/') ? 'image' : 'pdf',
    };
  }
}
