import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { JwtPayload } from '../interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if user is found', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: [{
          id: 'uuid',
          name: 'user',
        }],
        password: 'hashedPassword',
      };
      const payload: JwtPayload = { id: '123' };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as User);

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: [{
          id: 'uuid',
          name: 'user',
        }],
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload: JwtPayload = { id: '123' };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
