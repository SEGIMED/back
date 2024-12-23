import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import  * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}
  async login(createAuthDto: CreateAuthDto) {
    const user = await this.userRepository.findOne({
      where: {email: createAuthDto.email}
    })
    if(user){
      const isValid = await bcrypt.compare(createAuthDto.password, user.password)
      if(!isValid) {
          throw new BadRequestException("Email o password incorrectos")
      }
      const payload = {
          id: user.id,
          email: user.email,
          name: user.name
      }
      console.log(payload);
      const jwt = this.jwtService.sign(payload)
      return {success: 'User Login', token: jwt}
    }
    return 'This action adds a new auth';
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
