import { PickType } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export class CreatePatientDto extends PickType(CreateUserDto, ["email"]) {


    /**
     * User's direction
     * @example Arequipa y Moncayo
     */
    @IsString()
    @Length(3, 50)
    @IsOptional()
    direction?:string;

    /**
     * User's city
     * @example México
     */
    @IsString()
    @Length(3, 50)
    country?:String;

    /**
     * User's province
     * @example Molida
     */
    @IsString()
    @Length(3, 50)
    province?:String;

    /**
     * User's city
     * @example "Andalucia"
     */
    @IsString()
    @Length(3, 50)
    city?:String;

    /**
     * User's postal code
     * @example "s170205"
     */
    @IsString()
    @Length(3, 50)
    postal_code?:String;

    /**
     * User's direction
     * @example "Av. Sexta y calle 5748"
     */
    @IsString()
    @Length(3, 50)
    direction_number?:String;

    /**
     * User's apparment
     * @example "Ste. 4875"
     */
    @IsString()
    @Length(3, 50)
    apparment?:String;

    /**
     * User's health care nuber unique number
     * @example 56r78dse
     */
    @IsString()
    @Length(3, 50)
    health_care_number?:String;
    
    userId:String;
    appointments?:any[];
    medical_events?:any[];
}
