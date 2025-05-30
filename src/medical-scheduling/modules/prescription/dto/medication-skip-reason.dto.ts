import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

// NOTA: Esta tabla es un CATÁLOGO con CRUD completo
// Los motivos de omisión pueden ser gestionados por administradores del sistema

// DTO para crear nuevos motivos de omisión
export class CreateMedicationSkipReasonDto {
  @ApiProperty({
    description: 'Text description of the skip reason',
    example: 'Se me olvidó tomar el medicamento',
  })
  @IsString()
  @IsNotEmpty()
  reason_text: string;

  @ApiProperty({
    description: 'Category of the skip reason',
    example: 'Olvido',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}

// DTO para actualizar motivos de omisión
export class UpdateMedicationSkipReasonDto {
  @ApiProperty({
    description: 'Text description of the skip reason',
    example: 'Se me olvidó tomar el medicamento',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason_text?: string;

  @ApiProperty({
    description: 'Category of the skip reason',
    example: 'Olvido',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}

// DTO para respuesta de motivos de omisión (catálogo estático)
export class MedicationSkipReasonResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the skip reason',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Text description of the skip reason',
    example: 'Se me olvidó tomar el medicamento',
  })
  reason_text: string;

  @ApiProperty({
    description: 'Category of the skip reason',
    example: 'Olvido',
  })
  category: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-05-29T15:10:09.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-05-29T15:10:09.000Z',
  })
  updated_at: Date;
}

// DTO para consultar motivos de omisión por categoría (solo lectura)
export class MedicationSkipReasonQueryDto {
  @ApiProperty({
    description: 'Filter by category',
    example: 'Olvido',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Number of records per page',
    example: 50,
    required: false,
    default: 50,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Page offset for pagination',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  offset?: number;
}

// DTO para obtener categorías únicas de motivos de omisión
export class MedicationSkipReasonCategoriesDto {
  @ApiProperty({
    description: 'List of unique categories available in the catalog',
    example: [
      'No necesito medicamento',
      'Problemas de cobertura',
      'Efectos adversos',
      'Olvido',
      'Problemas logísticos',
      'Preocupaciones',
      'Otros',
    ],
    type: [String],
  })
  categories: string[];
}
