import { PartialType } from '@nestjs/swagger';
import { CreateMedicalOrderDto } from './create-medical_order.dto';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateMedicalOrderDto extends PartialType(CreateMedicalOrderDto) {
  @IsOptional()
  @IsString({ message: 'El archivo en base64 debe ser una cadena de texto' })
  @Matches(/^data:(image\/[^;]+|application\/pdf);base64,/, {
    message:
      'El formato del archivo base64 no es válido. Debe ser un DATA URI válido (data:mimetype;base64,)',
  })
  file?: string;
}
