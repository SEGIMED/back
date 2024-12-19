export class CreateMedicalEventDto {
  appointment_id: string;
  consultation_reason: string;
  physician_comments?: string;
  main_diagnostic_cie: string;
  evolution?: string;
  procedure?: string;
  treatment?: string;
  comments?: string;
  tenant_id: string;
}
