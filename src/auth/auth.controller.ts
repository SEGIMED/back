import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto, GoogleUserDto } from 'src/user/dto/create-user.dto';
import { RequestPasswordDto, ResetPasswordDto } from './dto/password-auth.dto';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post()
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @Post('google')
  googleLogin(@Body() GoogleUserDto: GoogleUserDto) {
    return this.authService.googleLogin(GoogleUserDto);
  }

  @Post('request-password')
  requestPasswordReset(
    @Body() RequestPasswordDto: RequestPasswordDto,
    @Req() req: Request,
  ): Promise<object> {
    return this.authService.requestPasswordReset(RequestPasswordDto, req);
  }

  @Post('reset-password')
  resetPassword(@Body() ResetPasswordDto: ResetPasswordDto): Promise<object> {
    return this.authService.resetPassword(
      ResetPasswordDto.token,
      ResetPasswordDto.password,
    );
  }

  @Post('send-otp')
  async sendVerificationCodePhone(
    @Body('user_id') user_id: string,
    @Body('phone_prefix') phone_prefix: string,
    @Body('phone') phone: string,
  ): Promise<object> {
    return this.authService.sendVerificationCodePhone(
      user_id,
      phone_prefix,
      phone,
    );
  }

  @Post('verify-otp')
  async verifyPhoneCode(
    @Body('user_id') user_id: string,
    @Body('code') code: string,
  ): Promise<object> {
    return this.authService.verifyPhoneCode(user_id, code);
  }
}
