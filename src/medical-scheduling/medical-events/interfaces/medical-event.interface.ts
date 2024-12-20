export interface MedicalEvent {
  id: string;
  appointment_id: string;
  patient_id: string;
  physician_id: string;
  physician_comments?: string;
  main_diagnostic_cie: string;
  consultation_reason: string;
  evolution?: string;
  procedure?: string;
  treatment?: string;
  tenant_id: string;
}
