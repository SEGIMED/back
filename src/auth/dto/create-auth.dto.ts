import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

export class CreateAuthDto extends PickType(CreateUserDto, [
  'email',
  'password',
  'google_id',
]) {}
