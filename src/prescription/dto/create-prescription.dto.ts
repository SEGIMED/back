import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator"

export class CreatePrescriptionDto {
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
    monodrug:string

    @IsString()
    @IsOptional()
    tenat_id?:string
}
