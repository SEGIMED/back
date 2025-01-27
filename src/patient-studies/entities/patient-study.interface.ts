export interface PatientStudy {
    id?: string;
    patient_id: string;
    physician_id: string;
    url?: string;
    title: string;
    description: string;
    tenant_id: string;
    is_deleted: boolean;
}