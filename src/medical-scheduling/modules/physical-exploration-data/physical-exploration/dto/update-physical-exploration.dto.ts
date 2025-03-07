import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { CreatePhysicalExplorationDto } from 'src/physical-exploration-data/physical-exploration/dto/create-physical-exploration.dto';

export class UpdatePhysicalExplorationDto extends PartialType(
  OmitType(CreatePhysicalExplorationDto, ['medical_event_id'] as const),
) {
  @IsUUID()
  @IsNotEmpty()
  medical_event_id: string;
}
