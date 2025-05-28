import { ApiProperty } from '@nestjs/swagger';

export class MedicalOrderBaseResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the medical order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'URL to access the medical order',
    example: 'https://example.com/orders/123',
  })
  url: string;

  @ApiProperty({
    description: 'Date when the order was requested',
    example: '2025-05-20T14:30:00Z',
  })
  request_date: Date;

  @ApiProperty({
    description: 'Name of the organization providing the order',
    example: 'General Hospital',
  })
  organization_name: string;

  @ApiProperty({
    description: 'Full name of the physician who created the order',
    example: 'Dr. Jane Smith',
  })
  physician_name: string;
}

export class MedicalOrderPhysicianResponseDto extends MedicalOrderBaseResponseDto {
  @ApiProperty({
    description: 'Full name of the patient',
    example: 'John Doe',
  })
  patient_name: string;

  @ApiProperty({
    description: 'Type of medical order',
    example: 'Prescription',
  })
  order_type: string;
}

export class MedicalOrderPatientResponseDto extends MedicalOrderBaseResponseDto {
  @ApiProperty({
    description: 'Type of medical order',
    example: 'Prescription',
  })
  order_type: string;

  @ApiProperty({
    description: 'ID of the tenant/organization',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  tenant_id: string;
}

export class MedicalOrderPaginatedResponseDto {
  @ApiProperty({
    description: 'Array of medical orders',
    type: [MedicalOrderBaseResponseDto],
  })
  data: MedicalOrderBaseResponseDto[];

  @ApiProperty({
    description: 'Total number of records',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}
