import { RoleType } from "@prisma/client";
import { Tenant } from "src/tenant/entities/tenant.interface";

export interface User {
    id?: String;
    name?: String;
    email?: String;
    dni?: String;
    birthdate?: Date;
    nationality?: String;
    gender?: String;
    phone_prefix?:String;
    phone?: String;
    password?: String;
    google_id?: String;
    image?: String;
    role_type?: RoleType;
    tenant?: Tenant;
    tenant_id?: String;
    createdAt?: Date;
    updatedAt?: Date;
}