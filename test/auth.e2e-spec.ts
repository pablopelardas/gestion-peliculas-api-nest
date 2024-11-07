import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/auth/entities';
import { Role } from '../src/auth/entities';
import { EnvConfiguration } from '../src/config/env.config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [EnvConfiguration],
          envFilePath: '.env.test', // Indicar que se use el archivo .env.test
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: EnvConfiguration().dbHost,
          port: +EnvConfiguration().dbPort,
          username: EnvConfiguration().dbUser,
          password: EnvConfiguration().dbPassword,
          database: EnvConfiguration().dbName,
          autoLoadEntities: true,
          synchronize: true, // Sincronizar automáticamente durante las pruebas
          dropSchema: true, // Eliminar el esquema después de cada prueba para garantizar una base limpia
          entities: [User, Role],
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role));

    // Insert roles in the database
    const adminRole = roleRepository.create({ name: 'admin' });
    const userRole = roleRepository.create({ name: 'user' });
    await roleRepository.save([adminRole, userRole]);

    // Insert user in the database
    const user = userRepository.create({
      email: 'user@example.com',
      password: bcrypt.hashSync('User123', 10), // Contraseña encriptada
      fullName: 'User Name',
      roles: [adminRole, userRole],
    });
    await userRepository.save(user);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'NewUser123',
          fullName: 'New User',
          roles: ['admin', 'user'],
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
          roles: ['admin', 'user'],
        })
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        error: 'Conflict',
        message: 'Key (email)=(user@example.com) already exists.',
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

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'user@example.com');
      expect(response.body).toHaveProperty('roles', expect.arrayContaining(['admin', 'user']));
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 if invalid email or password is provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'InvalidPassword',
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
