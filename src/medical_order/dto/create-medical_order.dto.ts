export class CreateMedicalOrderDto {
    id:string
    medical_order_type_id:string
    patient_id:string
    category_cie_diez_id?:number
    additional_text?:string
    application_date?:Date
    description_type?:string
}
