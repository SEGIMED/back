import { marital_status, role_type } from '@prisma/client';
/* import { Tenant } from 'src/tenant/entities/tenant.interface';
 */
export interface User {
  id?: string;
  name?: string;
  last_name?: string;
  email?: string;
  identification_number?: string;
  dniType?: string;
  birthdate?: Date;
  nationality?: string;
  gender?: string;
  phone_prefix?: string;
  phone?: string;
  password?: string;
  google_id?: string;
  image?: string;
  role?: role_type;
  marital_status?: marital_status;
  /*   tenant?: Tenant; */
  tenant_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
