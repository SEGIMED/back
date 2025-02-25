import { PartialType } from '@nestjs/swagger';
import { CreateCatCieDiezDto } from './create-cat-cie-diez.dto';

export class UpdateCatCieDiezDto extends PartialType(CreateCatCieDiezDto) {}
