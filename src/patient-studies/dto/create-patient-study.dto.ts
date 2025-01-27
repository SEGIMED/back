import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class CreatePatientStudyDto {
    @IsString()
    @Length(3, 100)
    patient_id: string;

    @IsString()
    @Length(3, 100)
    physician_id: string;

    @IsString()
    @IsOptional()
    url?: string;

    @IsString()
    @Length(3, 100)
    title: string;

    @IsString()
    @Length(3, 500)
    description: string;

    @IsString()
    @Length(3, 100)
    tenant_id: string;

    @IsBoolean()
    is_deleted: boolean = false;
}