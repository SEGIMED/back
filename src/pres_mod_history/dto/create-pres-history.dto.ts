import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator"

export class CreatePresHistoryDto {
    // Prescription - information
    @IsDate()
    @IsOptional()
    start_timestamp?:Date

    @IsDate()
    @IsOptional()
    end_timestamp?:Date

    @IsString()
    @IsOptional()
    description?:string

    @IsBoolean()
    @IsOptional()
    active?:boolean

    @IsString()
    @IsOptional()
    patient_id?:string

    @IsString()
    @IsOptional()
    monodrug?:string

    @IsString()
    @IsOptional()
    tenat_id?:string

    // Prescription modification History

    @IsString()
    @IsOptional()
    prescription_id: string

    @IsString()
    @IsOptional()
    physician_id:string

    @IsDate()
    @IsOptional()
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
