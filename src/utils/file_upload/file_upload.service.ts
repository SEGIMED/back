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
}
