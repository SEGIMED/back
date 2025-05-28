export class GetPatientsDto {
  id: string;
  name: string;
  last_name: string;
  image: string;
  birth_date: Date;
  gender: string;
  email: string;
  phone: string;
  prefix: string;
  dni: string;
  health_care_number: string;
}

export class GetPatientDto {
  id: string;
  name: string;
  last_name: string;
  image: string;
  birth_date: Date;
  email: string;
  notes: string;
  vital_signs: VitalSignDto[];
  files: FileDto[];
  evaluation: EvaluationDto;
  background: BackgroundDto;
  current_medication: MedicationDto[];
  future_medical_events: MedicalEventDto[];
  past_medical_events: MedicalEventDto[];
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
