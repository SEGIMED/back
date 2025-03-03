import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Multer } from 'multer';
import { Readable } from 'stream';

@Injectable()
export class FileUploadRepository {
  async uploadFile(
    file: Multer.File,
    isImage: boolean,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: isImage ? 'uploads' : 'documents',
          resource_type: isImage ? 'image' : 'raw',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }
}
