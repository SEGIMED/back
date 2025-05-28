import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePhysicalExplorationAreaDto {
  @ApiProperty({
    description:
      'A unique library identifier for the physical exploration area (e.g., a code or standardized abbreviation).',
    example: 'ABDOMEN_RUQ',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name_on_library: string;

  @ApiProperty({
    description: 'The human-readable name of the physical exploration area.',
    example: 'Abdomen - Right Upper Quadrant',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
