export interface physicalExamination{
    id?: string;
    physical_subsystem_id: string;
    patient_id: string;
    description: string;
    medical_event_id: string;
    tenant_id: string;
    createdAt: Date;
    updatedAt: Date;
}