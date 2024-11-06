import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

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

}
