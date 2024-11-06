import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: 'Register a new user'})
  @ApiResponse({status: 201, description: 'User created successfully'})
  @ApiResponse({status: 400, description: 'Invalid data'})
  @ApiResponse({status: 409, description: 'User already exists'})
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({summary: 'Login a user'})
  @ApiResponse({status: 200, description: 'User logged in successfully', example:{
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
      email: 'user@example.com',
      roles: ['user'],
    }})
  @ApiResponse({status: 401, description: 'Invalid email or password'})
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

}
