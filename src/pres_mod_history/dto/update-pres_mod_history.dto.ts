import { PartialType } from '@nestjs/swagger';
import { CreatePresModHistoryDto } from './create-pres_mod_history.dto';

export class UpdatePresModHistoryDto extends PartialType(CreatePresModHistoryDto) {}
