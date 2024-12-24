import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { TenantType } from "@prisma/client";

export class CreateTenantDto {
    /**
     * Set tenatn's type
     * @Example "INDIVIDUAL"
     */
    @IsNotEmpty()
    @IsEnum(TenantType)
    type: TenantType

    /**
     * Set database name
     * @example Alcala
     */
    @IsString()
    db_name: string
}
