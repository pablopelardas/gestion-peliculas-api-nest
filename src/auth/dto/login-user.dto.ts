import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: true,
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'User123',
    description: 'User password, must have a Uppercase, lowercase letter and a number',
    required: true,
  })
  password: string;
}
