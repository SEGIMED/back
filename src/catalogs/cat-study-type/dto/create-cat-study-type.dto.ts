import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCatStudyTypeDto {
  @ApiProperty({
    description: 'The name of the study type',
    example: 'Blood Test',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
