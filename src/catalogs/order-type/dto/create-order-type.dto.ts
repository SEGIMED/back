import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderTypeDto {
  @ApiProperty({
    description: 'ID of the order type (optional)',
    example: 'lab-test',
    required: false,
  })
  @IsOptional()
  id: string;

  @ApiProperty({
    description: 'Name of the order type',
    example: 'Laboratory Test',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the order type',
    example: 'Medical order for laboratory tests',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
