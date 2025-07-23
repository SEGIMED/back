import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreatePatientInsuranceDto } from "./create-patient-insurance.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePatientInsuranceDto extends PartialType(CreatePatientInsuranceDto) {
  @ApiProperty({
    description: 'El ID de la aseguradora',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  insurance_id: string;
}