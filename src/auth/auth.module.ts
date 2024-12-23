import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
