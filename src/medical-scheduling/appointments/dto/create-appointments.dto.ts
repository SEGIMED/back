export class CreateAppointmentDto {
  consultation_reason: string;
  start: Date;
  end: Date;
  patient_id: string;
  physician_id: string;
  status: 'Atendida' | 'Cancelada' | 'Pendiente';
  tenant_id: string;
}
