import { PartialType } from '@nestjs/swagger';
import { CreateMedicalOrderDto } from './create-medical_order.dto';

export class UpdateMedicalOrderDto extends PartialType(CreateMedicalOrderDto) {}
