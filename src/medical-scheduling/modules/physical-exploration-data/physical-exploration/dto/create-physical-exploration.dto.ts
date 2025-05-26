import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class CreatePhysicalExplorationDto {
  @ApiProperty({
    description: "Patient's unique identifier",
    example: 'uuid-patient-123',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @ApiProperty({
    description: "Physician's unique identifier",
    example: 'uuid-physician-456',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  physician_id: string;

  @ApiProperty({
    description: "Medical event's unique identifier",
    example: 'uuid-event-789',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  medical_event_id: string;

  @ApiProperty({
    description: 'Detailed description of the physical exploration findings',
    example: 'Patient reports mild tenderness in the abdominal area.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @ApiProperty({
    description: 'Identifier for the physical exploration area',
    example: 1,
    minimum: 1,
    type: 'integer',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  physical_exploration_area_id: number;

  @ApiProperty({
    description: "Tenant's unique identifier",
    example: 'tid_abc123',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  tenant_id: string;
}
