import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidRoles } from './interfaces';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call register method of AuthService', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: [ValidRoles.ADMIN, ValidRoles.USER],
      };

      await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should return 409 if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: [ValidRoles.ADMIN, ValidRoles.USER],
      };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
    it ('should return 400 if invalid data is provided', async () => {
      const createUserDto = {
        email: 'user@example.com',
        fullName: 'User Name',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Invalid data'),
      );
      await expect(controller.register(createUserDto as CreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should return 400 if invalid role is provided', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: ['banana'],
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Invalid data'),
      );
      await expect(controller.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

    describe('login', () => {
      it('should call login method of AuthService', async () => {
        const loginUserDto: LoginUserDto = {
          email: 'user@example.com',
          password: 'User123',
        };

        await controller.login(loginUserDto);

        expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
      });
      it('should return 401 if invalid email or password is provided', async () => {
        const loginUserDto: LoginUserDto = {
          email: 'user@example.com',
          password: 'User123',
        };

        mockAuthService.login.mockRejectedValue(
          new UnauthorizedException('Invalid email or password'),
        );
        await expect(controller.login(loginUserDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });
      it('should return 401 if user not found', async () => {
        const loginUserDto: LoginUserDto = {
          email: 'user@example.com',
          password: 'User123',
        };

        mockAuthService.login.mockRejectedValue(
          new UnauthorizedException('Invalid email or password'),
        );
        await expect(controller.login(loginUserDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });
      it('should return 200 if user found', async () => {
        const loginUserDto: LoginUserDto = {
          email: 'user@example.com',
          password: 'User123',
        };

        mockAuthService.login.mockResolvedValue({
          id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
          email: 'user@example.com',
          roles: ['user'],
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
        const response = await controller.login(loginUserDto);
        expect(response).toEqual({
          id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
          email: 'user@example.com',
          roles: ['user'],
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        });
      });
    });
});
