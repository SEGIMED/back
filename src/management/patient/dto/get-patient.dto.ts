import { EmergencyContact } from "src/management/emergency-contact/entities/emergency-contact.interface";
import { PatientInsurance } from "src/management/patient-insurance/entities/patient-insurance.interface";

export class GetPatientsDto {
  id: string;
  name: string;
  last_name: string;
  image: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  prefix: string;
  identification_number: string;
  identification_type: string;
  health_care_number: string;
  main_diagnostic_cie: string;
}

export class GetPatientDto {
  id: string;
  name: string;
  last_name: string;
  image: string;
  birth_date: Date;
  age: number;
  email: string;
  notes: string;
  vital_signs: VitalSignDto[];
  files: FileDto[];
  evaluation: EvaluationDto;
  background: BackgroundDto;
  current_medication: MedicationDto[];
  future_medical_events: MedicalEventDto[];
  past_medical_events: MedicalEventDto[];
  emergency_contact?: EmergencyContact;
  insurance?: PatientInsurance;
}

export class GetPatientSimpleDto {
  id: string;
  name: string;
  last_name?: string;
  gender: string;
  nationality?: string;
  email: string;
  phone?: string;
  phone_prefix?: string;
  marital_status?: string;
  birth_date?: Date;
  image?: string;
  direction?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  direction_number?: string;
  apartment?: string;
  emergency_contact?: EmergencyContact;
  insurance?: PatientInsurance;
}

export class VitalSignDto {
  id: string;
  vital_sign_category: string;
  measure: number;
  vital_sign_measure_unit: string;
}

export class FileDto {
  id: string;
  name: string;
  url: string;
}

export class EvaluationDto {
  id: string;
  details: string;
  date: Date;
}

export class BackgroundDto {
  id: string;
  details: string;
  date: Date;
}

export class MedicationDto {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  active: boolean;
}

export class MedicalEventDto {
  id: string;
  date: Date;
  time: string;
  doctor: string;
  reason: string;
  status: string;
}
