import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponse {
  @ApiProperty({
    description: 'URL segura del archivo subido',
    example:
      'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Tipo de archivo (image o pdf)',
    example: 'image',
    enum: ['image', 'pdf'],
  })
  type: string;
}
