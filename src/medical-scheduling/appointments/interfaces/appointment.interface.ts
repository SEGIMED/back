export interface Appointment {
  id: string;
  start: Date;
  end: Date;
  patient_id: string;
  physician_id: string;
  status: 'Atendida' | 'Cancelada' | 'Pendiente';
  cancelation_reason?: string;
  tenant_id: string;
}
