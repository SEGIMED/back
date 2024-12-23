import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
