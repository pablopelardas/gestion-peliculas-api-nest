import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { Role, User } from '../src/auth/entities';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

const validRoles = [
  'admin',
  'user',
];

const users: User[] = [];

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(({ where: { email: user } }) => {
      const userDb = users.find((u) => u.email === user);
      if (!userDb) return null;
      return Promise.resolve({
        id: userDb.id,
        email: userDb.email,
        roles: userDb.roles,
        password: userDb.password,
      });
    }),
    create: jest.fn().mockImplementation((user) => {
      return {
        ...user,
        roles: []
      };
    }),
    save: jest.fn().mockImplementation((user) => {
      if (users.find((u) => u.email === user.email)) {
        return Promise.reject({
          code: '23505',
          detail: 'Key (email)=(user@example.com) already exists.',
        });
      }
      user.id = '2d6a6b00-170d-4980-bad6-e884a37f5d71';
      users.push(user);

      return Promise.resolve({
        ...user,
      });
    }),
  };
  const mockRoleRepository = {
    findOneBy: jest.fn().mockImplementation((role) => {
      if (!validRoles.includes(role.name)) return null;
      return { id: 'uuid', name: role.name };
    }),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, JwtService],
      imports: [AuthModule, ConfigModule],
    })
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: jest.fn().mockImplementation((payload) => {
          return {
            id: payload.id,
            email: payload.email,
            roles: payload.roles,
          };
        }),
      })
      .overrideProvider(JwtService)
      .useValue({
        sign: jest.fn().mockImplementation(() => {
          return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        }),
      })
      .overrideProvider(getRepositoryToken(User)).useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Role)).useValue(mockRoleRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'User123',
          fullName: 'User Name',
          roles: [validRoles[0], validRoles[1]],
        })
        .expect(201);
    });
    it('should return 409 if user already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'User123',
          fullName: 'User Name',
          roles: [validRoles[0], validRoles[1]],
        })
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: 'User already exists: Key (email)=(user@example.com) already exists.',
      });
    });
    it('should return 400 if invalid data is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          fullName: 'User Name',
        })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'User123',
        })
        .expect(200);

      expect(response.body).toEqual({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        email: 'user@example.com',
        roles: ['admin','user'],
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      });
    });
    it('should return 401 if invalid email or password is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'invalidPassword',
        })
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    });

    it('should return 401 if user not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'not-found@example.com',
          password: 'User123',
        })
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    });

  });
});
