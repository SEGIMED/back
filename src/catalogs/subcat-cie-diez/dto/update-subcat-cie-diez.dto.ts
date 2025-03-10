import { PartialType } from '@nestjs/swagger';
import { CreateSubcatCieDiezDto } from './create-subcat-cie-diez.dto';

export class UpdateSubcatCieDiezDto extends PartialType(
  CreateSubcatCieDiezDto,
) {}
