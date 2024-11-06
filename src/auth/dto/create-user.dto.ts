import { IsArray, IsEmail, IsEnum, IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ValidRoles } from '../interfaces/valid-roles.interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
    required: true,
  })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  @ApiProperty({
    example: 'User123',
    description: 'User password, must have a Uppercase, lowercase letter and a number',
    required: true,
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'User Name',
    description: 'User full name',
    required: true,
  })
  fullName: string;

  @ApiProperty({
    example: [ValidRoles.ADMIN, ValidRoles.USER],
    description: 'User roles, must be one of the following: ' + ValidRoles.ADMIN + ', ' + ValidRoles.USER,
    required: true,
  })
  @IsArray()
  @IsEnum(ValidRoles, { each: true })
  roles: string[];

}
