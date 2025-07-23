import { Controller, Post, Body, Req, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import {
  CreateUserDto,
  GoogleUserDto,
} from 'src/management/user/dto/create-user.dto';
import { RequestPasswordDto, ResetPasswordDto } from './dto/password-auth.dto';
import { Request } from 'express';
import { CreateSuperAdminDto } from './dto/create-superadmin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user in the system',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('create-superadmin')
  @ApiOperation({
    summary: 'Create a super admin user',
    description:
      'Creates a super admin user with full privileges. If the super admin tenant does not exist, it will be created automatically.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Super admin successfully created',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Superadmin creado exitosamente',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            last_name: { type: 'string' },
            role: { type: 'string' },
          },
        },
        tenant: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            created: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data' })
  createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.authService.createSuperAdmin(createSuperAdminDto);
  }

  @Post()
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Google login',
    description: 'Authenticates a user with Google credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated with Google',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid Google credentials',
  })
  googleLogin(@Body() GoogleUserDto: GoogleUserDto) {
    return this.authService.googleLogin(GoogleUserDto);
  }

  @Post('request-password')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  requestPasswordReset(
    @Body() RequestPasswordDto: RequestPasswordDto,
    @Req() req: Request,
  ): Promise<object> {
    return this.authService.requestPasswordReset(RequestPasswordDto, req);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password using a token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token',
  })
  resetPassword(@Body() ResetPasswordDto: ResetPasswordDto): Promise<object> {
    return this.authService.resetPassword(
      ResetPasswordDto.token,
      ResetPasswordDto.password,
    );
  }

  @Post('send-otp')
  @ApiOperation({
    summary: 'Send OTP code',
    description: 'Sends a verification code to the user phone',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification code sent' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user ID or phone number',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User ID' },
        phone_prefix: {
          type: 'string',
          description: 'Phone prefix (e.g. +1, +52)',
        },
        phone: { type: 'string', description: 'Phone number' },
      },
      required: ['user_id', 'phone_prefix', 'phone'],
    },
  })
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
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verifies the OTP code sent to the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid OTP code',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User ID' },
        code: { type: 'string', description: 'Verification code' },
      },
      required: ['user_id', 'code'],
    },
  })
  async verifyPhoneCode(
    @Body('user_id') user_id: string,
    @Body('code') code: string,
  ): Promise<object> {
    return this.authService.verifyPhoneCode(user_id, code);
  }
}
