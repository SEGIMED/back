export interface Appointment {
  id: string;
  start: Date;
  end: Date;
  patient_id: string;
  physician_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  cancelation_reason?: string;
  tenant_id: string;
}
