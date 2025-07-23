export interface EmergencyContact {
  id?: string;
  patient_id?: string;
  contact_name?: string;
  relationship?: string;
  email?: string;
  phone_prefix: string;
  phone: string;
}