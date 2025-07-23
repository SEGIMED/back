import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateEmergencyContactDto } from "./create-emergency-contact.dto";
import { IsNotEmpty, IsString } from "class-validator"; // o el decorador que corresponda según el tipo de id

export class UpdateEmergencyContactDto extends PartialType(CreateEmergencyContactDto) {
  @ApiProperty({ description: 'ID del contacto de emergencia', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  emergency_contact_id: string;
}