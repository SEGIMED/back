import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePhysicalExplorationDto } from './create-physical-exploration.dto';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UpdatePhysicalExplorationDto extends PartialType(
  OmitType(CreatePhysicalExplorationDto, ['medical_event_id'] as const),
) {
  @IsUUID()
  @IsNotEmpty()
  medical_event_id: string;
}
