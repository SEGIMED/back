import { IsString, IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatVitalSignsDto {
  @ApiProperty({
    description: 'Name of the vital sign',
    example: 'Heart Rate',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Category of the vital sign',
    example: 'Cardiovascular',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'List of specialty IDs associated with this vital sign',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  specialties: number[];
}
