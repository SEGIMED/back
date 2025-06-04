import { PartialType } from '@nestjs/mapped-types';
import { CreateCatIdentificationTypeDto } from './create-cat-identification-type.dto';

export class UpdateCatIdentificationTypeDto extends PartialType(
  CreateCatIdentificationTypeDto,
) {}
