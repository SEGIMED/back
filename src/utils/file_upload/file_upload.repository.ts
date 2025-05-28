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

  /**
   * Sube un archivo a Cloudinary a partir de un DATA URI en base64
   * @param dataUri DATA URI en formato base64 (ej: data:application/pdf;base64,JVBERi0...)
   * @param filename Nombre del archivo (opcional)
   * @returns Resultado de la subida a Cloudinary
   */
  async uploadBase64File(dataUri: string, filename?: string): Promise<any> {
    try {
      if (!dataUri || !dataUri.includes('base64')) {
        throw new Error('El formato del DATA URI no es válido');
      }

      // Determinar el tipo de recurso a partir del DATA URI
      let resourceType = 'auto';
      const mimeMatch = dataUri.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

      if (mimeType.startsWith('image/')) {
        resourceType = 'image';
      } else if (mimeType === 'application/pdf') {
        resourceType = 'auto';
      }

      // Configurar opciones de subida
      const uploadOptions: any = {
        resource_type: resourceType as 'auto' | 'image' | 'raw',
        folder: resourceType === 'image' ? 'images' : 'documents',
      };

      // Añadir nombre de archivo si está disponible
      if (filename) {
        uploadOptions.public_id = filename.replace(/\.[^/.]+$/, ''); // Quitar extensión
      }

      // Subir a Cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        dataUri,
        uploadOptions,
      );

      return uploadResult;
    } catch (error) {
      console.error('Error al subir el archivo base64 a Cloudinary:', error);
      throw new Error('Error al subir el archivo a Cloudinary');
    }
  }
}
