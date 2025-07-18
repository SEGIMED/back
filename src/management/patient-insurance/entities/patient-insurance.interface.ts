import { insurance_status } from "@prisma/client";

export interface PatientInsurance {
  id: string;
  patient_id: string;
  insurance_provider: string;
  insurance_number: string;
  insurance_status: insurance_status;
}