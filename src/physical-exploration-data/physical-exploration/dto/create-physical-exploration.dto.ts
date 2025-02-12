import {
  IsUUID,
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class CreatePhysicalExplorationDto {
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @IsUUID()
  @IsNotEmpty()
  medical_event_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsInt()
  @Min(1)
  physical_exploration_area_id: number;

  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;
}
