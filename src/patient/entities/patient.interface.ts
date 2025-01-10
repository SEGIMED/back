export interface Patient{
    id?:String;
    last_name?:String;
    direction?:String;
    country?:String;
    province?:String;
    city?:String;
    postal_code?:String;
    direction_number?:String;
    apparment?:String;
    health_care_number?:String;
    userId?:String;
    appointments?:any[];
    medical_events?:any[];
}