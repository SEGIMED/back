import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Multer } from 'multer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadRepository {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Multer.File): Promise<any> {
    try {
      // Convertir el buffer a base64
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      console.log(base64String);
      console.log(file);

      // Determinar el tipo de recurso
      let resourceType = 'auto';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype === 'application/pdf') {
        resourceType = 'auto';
      }

      // Subir a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64String, {
        resource_type: resourceType as 'auto' | 'image' | 'raw',
        folder: resourceType === 'image' ? 'images' : 'documents',
      });

      return uploadResult;
    } catch (error) {
      console.error('Error al subir el archivo a Cloudinary:', error);
      throw new Error('Error al subir el archivo a Cloudinary');
    }
  }
}
