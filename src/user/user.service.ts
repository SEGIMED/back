import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import  * as bcrypt from "bcrypt"

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepository: Repository<Tenant> 
  ){}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10)
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt)
    const user = this.userRepository.create(createUserDto)
    await this.userRepository.save(user)
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find()
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
