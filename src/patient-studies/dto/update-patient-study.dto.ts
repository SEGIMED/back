import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientStudyDto } from './create-patient-study.dto';

export class UpdatePatientStudyDto extends PartialType(CreatePatientStudyDto) {}