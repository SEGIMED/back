import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CancelTrackingDto {
  @ApiProperty({
    description:
      'ID of the skip reason from the medication skip reason catalog',
    example: 1,
  })
  @IsNumber()
  skip_reason_id: number;

  @ApiProperty({
    description: 'Additional details about why tracking is being cancelled',
    example: 'Doctor recommended stopping the medication',
    required: false,
  })
  @IsString()
  @IsOptional()
  skip_reason_details?: string;
}
