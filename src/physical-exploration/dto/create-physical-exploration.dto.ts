import { IsUUID, IsString, IsInt, Min } from 'class-validator';

export class CreatePhysicalExplorationDto {
  @IsUUID()
  patient_id: string;

  @IsUUID()
  physician_id: string;

  @IsUUID()
  medical_event_id: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  physical_exploration_area_id: number;

  @IsUUID()
  tenant_id: string;
}
