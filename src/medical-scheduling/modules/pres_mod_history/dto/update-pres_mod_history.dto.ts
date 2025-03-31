import { PartialType } from '@nestjs/swagger';
import { CreatePresHistoryDto } from 'src/medical-scheduling/modules/pres_mod_history/dto/create-pres-history.dto';

export class UpdatePresModHistoryDto extends PartialType(
  CreatePresHistoryDto,
) {}
