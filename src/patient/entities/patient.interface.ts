export interface Patient {
  id?: string;
  direction?: string;
  country?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  direction_number?: string;
  apparment?: string;
  health_care_number?: string;
  userId?: string;
  appointments?: any[];
  medical_events?: any[];
}
