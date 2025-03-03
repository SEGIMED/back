export interface PatientStudy {
  id?: string;
  patient_id: string;
  physician_id: string;
  url?: string;
  title: string;
  description: string;
  cat_study_type_id: string;
  tenant_id: string;
  is_deleted: boolean;
}
