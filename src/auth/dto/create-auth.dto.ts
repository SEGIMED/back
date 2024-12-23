import { PartialType } from "@nestjs/mapped-types";
import { PickType } from "@nestjs/swagger";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { User } from "src/user/entities/user.entity";

export class CreateAuthDto extends PickType(CreateUserDto, [
    'email', 'password'
]){}
