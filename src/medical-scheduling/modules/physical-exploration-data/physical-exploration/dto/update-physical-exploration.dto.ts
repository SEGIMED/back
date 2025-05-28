import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger'; // Corrected import for ApiProperty
import { CreatePhysicalExplorationDto } from './create-physical-exploration.dto';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdatePhysicalExplorationDto extends PartialType(
  OmitType(CreatePhysicalExplorationDto, ['medical_event_id'] as const),
) {
  @ApiProperty({
    description:
      "Medical event's unique identifier. This is required for an update operation to identify the record.",
    example: 'uuid-event-789-existing',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  medical_event_id: string;
}
