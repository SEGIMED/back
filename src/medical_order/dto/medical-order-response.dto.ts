export class MedicalOrderBaseResponseDto {
  id: string;
  url: string;
  request_date: Date;
  organization_name: string;
  physician_name: string;
}

export class MedicalOrderPhysicianResponseDto extends MedicalOrderBaseResponseDto {
  patient_name: string;
  order_type: string;
}

export class MedicalOrderPatientResponseDto extends MedicalOrderBaseResponseDto {
  order_type: string;
  tenant_id: string;
}

export class MedicalOrderPaginatedResponseDto {
  data: MedicalOrderBaseResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
