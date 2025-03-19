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
}
