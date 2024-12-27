import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login(createAuthDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });
    if (user) {
      const isValid = await bcrypt.compare(
        createAuthDto.password,
        user.password,
      );
      if (!isValid) {
        throw new BadRequestException('Email o password incorrectos');
      }
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      console.log(payload);
      const jwt = this.jwtService.sign(payload);
      return { success: 'User Login', token: jwt };
    }
    return 'This action adds a new auth';
  }
}
