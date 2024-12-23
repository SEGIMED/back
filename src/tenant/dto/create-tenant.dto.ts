import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Tenants } from "../tenants.enum";
import { Type } from "class-transformer";

export class CreateTenantDto {
    /**
     * Set tenatn's type
     * @Example individual
     */
    @IsNotEmpty()
    @IsEnum(Tenants)
    type: Tenants

    /**
     * Set database name
     * @example Alcala
     */
    @IsString()
    db_name: string
}
