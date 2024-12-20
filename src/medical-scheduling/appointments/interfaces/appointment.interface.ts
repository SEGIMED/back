export interface Appointment {
  id: string;
  consultation_reason: string;
  start: Date;
  end: Date;
  patient_id: string;
  physician_id: string;
  status: 'Atendida' | 'Cancelada' | 'Pendiente';
  cancelation_reason: string;
  comments: string;
  tenant_id: string;
}
