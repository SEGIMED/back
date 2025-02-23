import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class CreatePatientStudyDto {
    @IsString({ message: 'El ID del paciente debe ser una cadena de texto' })
    @Length(3, 100, { message: 'El ID del paciente debe tener entre 3 y 100 caracteres' })
    patient_id: string;

    @IsString({ message: 'El ID del médico debe ser una cadena de texto' })
    @Length(3, 100, { message: 'El ID del médico debe tener entre 3 y 100 caracteres' })
    physician_id: string;

    @IsOptional()
    @IsString({ message: 'La URL debe ser una cadena de texto' })
    url?: string;

    @IsString({ message: 'El título debe ser una cadena de texto' })
    @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres' })
    title: string;

    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @Length(3, 500, { message: 'La descripción debe tener entre 3 y 500 caracteres' })
    description: string;

    @IsString({ message: 'El ID del paciente debe ser una cadena de texto' })
    @Length(3, 100, { message: 'Hubo un error en el ID del catalogo' })
    cat_study_type_id: string;

    @IsString({ message: 'El ID del inquilino debe ser una cadena de texto' })
    @Length(3, 100, { message: 'El ID del inquilino debe tener entre 3 y 100 caracteres' })
    tenant_id: string;

    @IsBoolean({ message: 'El campo is_deleted debe ser un valor booleano' })
    is_deleted: boolean = false;
}
