import { IsDate, IsOptional, IsString } from "class-validator"

export class CreatePresModHistoryDto {

    @IsString()
    prescription_id: string

    @IsString()
    physician_id:string

    @IsDate()
    mod_timestamp:Date

    @IsOptional()
    medical_event_id?:string

    // @IsOptional()
    // medical_order_id:string?

    @IsOptional()
    observations?:string

    @IsString()
    dose:string

    @IsString()
    dose_units:string

    @IsString()
    frecuency:string

    @IsString()
    duration:string

    @IsString()
    duration_units:string
}
