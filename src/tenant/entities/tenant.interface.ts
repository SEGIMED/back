import { TenantType, User } from "@prisma/client";

export interface Tenant {
  id?: String;
  type?: TenantType;
  db_name?: String;
  createdAt?: Date;
  updatedAt?: Date;
  users?:   User[];
}