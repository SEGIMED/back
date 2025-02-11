import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class CreatePhysicalExplorationDto {
  @IsUUID()
  medical_event_id: string;

  @IsUUID()
  patient_id: string;

  @IsUUID()
  physician_id: string;

  @IsInt()
  @Min(1)
  physical_exploration_area_id: number;

  @IsString()
  description: string;

  @IsUUID()
  tentat_id: string;
}
