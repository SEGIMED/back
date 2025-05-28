import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuardAuthModule } from '../../auth/guard-auth.module';

@Module({
  imports: [GuardAuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
