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
}
