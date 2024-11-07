import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role, User } from './entities';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidRoles } from './interfaces';
import { LoginUserDto } from './dto/login-user.dto';
import { CommonModule } from '../common/common.module';

describe('AuthService', () => {
  let service: AuthService;

  const validRoles = [ValidRoles.ADMIN, ValidRoles.USER];

  const users = [
    {
      id: '324a6b00-170d-4980-bad6-e884a37f5d71',
      email: 'admin@example.com',
      password: bcrypt.hashSync('Admin123', 10),
      fullName: 'Admin',
      roles: [{
        id: 'uuid',
        name: ValidRoles.ADMIN,
      },
      {
        id: 'uuid',
        name: ValidRoles.USER,
      }],
    },
    {
      id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
      email: 'user@example.com',
      password: bcrypt.hashSync('User123', 10),
      fullName: 'User',
      roles: [{
        id: 'uuid',
        name: ValidRoles.USER,
      }],
    },
  ];

  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(({ where: { email: user } }) => {
      const userDb = users.find((u) => u.email === user);
      if (!userDb) return null;
      return Promise.resolve({
        ...userDb,
      });
    }),
    findOneBy: jest.fn(),
    create: jest.fn().mockImplementation((user) => user),
    save: jest.fn(),
  };
  const mockRoleRepository = {
    findOneBy: jest.fn().mockImplementation((role) => {
      if (!validRoles.includes(role.name)) return null;
      return { id: 'uuid', name: role.name };
    }),
    save: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn().mockImplementation(() => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'),
  };

  const mockPostgresDuplicateDataError = {
    code: '23505',
    detail: 'Key (email)=(user@example.com) already exists.',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CommonModule],
      providers: [AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('register', () => {
    it('should call save method of UserRepository', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: [ValidRoles.ADMIN, ValidRoles.USER],
      };

      await service.register(createUserDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: expect.any(String),
        fullName: 'User Name',
        roles: [
          {
            id: expect.any(String),
            name: ValidRoles.ADMIN,
          },
          {
            id: expect.any(String),
            name: ValidRoles.USER,
          },
        ],
      });
    });
    it('should return 409 if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: [ValidRoles.ADMIN, ValidRoles.USER],
      };

      mockUserRepository.save.mockRejectedValue(
        mockPostgresDuplicateDataError,
      );

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
    it('should return 400 if invalid role is provided', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'User123',
        fullName: 'User Name',
        roles: ['banana'],
      };

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('login', () => {
    it('should call findOne method of UserRepository', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user@example.com',
        password: 'User123',
      };

      await service.login(loginUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email.toLowerCase() },
        select: ['id', 'email', 'roles', 'password'],
      });
    });
    it('should return 401 if invalid email or password is provided', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user@example.com',
        password: 'invalidPassword',
      };

      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should return 401 if user not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'not-found@example.com',
        password: 'User123',
      };

      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should return 200 if user found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'user@example.com',
        password: 'User123',
      };

      const response = await service.login(loginUserDto);

      expect(response).toEqual({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        email: 'user@example.com',
        fullName: 'User',
        roles: [ValidRoles.USER],
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      });
    });
  });
});
