import { PartialType } from '@nestjs/swagger';
import { CreatePresHistoryDto } from './create-pres-history.dto';

export class UpdatePresModHistoryDto extends PartialType(
  CreatePresHistoryDto,
) {}
