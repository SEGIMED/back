export interface PatientStudy {
  id?: string;
  patient_id: string;
  physician_id: string;
  url?: string;
  title: string;
  description: string;
  cat_study_type_id: number;
  cat_study_type?: {
    id: number;
    name: string;
  };
  tenant_id: string;
  is_deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
