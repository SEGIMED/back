import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class VitalSignItemDto {
  @IsInt()
  @IsNotEmpty()
  vital_sign_id: number;

  @IsInt()
  @IsNotEmpty()
  measure: number;
}

export class PhysicalExplorationItemDto {
  @IsInt()
  @IsNotEmpty()
  physical_exploration_area_id: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class PhysicalExaminationItemDto {
  @IsInt()
  @IsOptional()
  physical_subsystem_id?: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class AttendMedicalEventDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  physician_comments?: string;

  @IsString()
  @IsOptional()
  main_diagnostic_cie?: string;

  @IsString()
  @IsOptional()
  evolution?: string;

  @IsString()
  @IsOptional()
  procedure?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VitalSignItemDto)
  @IsOptional()
  vital_signs?: VitalSignItemDto[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  subcategory_cie_ids?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhysicalExplorationItemDto)
  @IsOptional()
  physical_explorations?: PhysicalExplorationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhysicalExaminationItemDto)
  @IsOptional()
  physical_examinations?: PhysicalExaminationItemDto[];

  @IsBoolean()
  @IsOptional()
  consultation_ended?: boolean;
}
