import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/auth/auth.module';
import { Movie } from '../src/movies/entities/movie.entity';
import { MoviesModule } from '../src/movies/movies.module';
import { User } from '../src/auth/entities';
import { Role } from '../src/auth/entities';
import { EnvConfiguration } from '../src/config/env.config';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let authTokenAdmin: string;
  let authTokenUser: string;

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
          entities: [User, Role, Movie],
        }),
        AuthModule,
        MoviesModule,
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
      email: 'admin@example.com',
      password: bcrypt.hashSync('hashedPassword', 10),
      fullName: 'Admin User',
      roles: [adminRole],
    });
    const user2 = userRepository.create({
      email: 'user@example.com',
      password: bcrypt.hashSync('hashedPassword', 10),
      fullName: 'User',
      roles: [userRole],
    });
    await userRepository.save(user);
    await userRepository.save(user2);

    // Authenticate the user
    const responseAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'hashedPassword',
      });
    authTokenAdmin = responseAdmin.body.token;

    // Authenticate the user
    const responseUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'hashedPassword',
      });
    authTokenUser = responseUser.body.token;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/movies/sync (POST)', () => {
    it('should sync movies with external API', async () => {
      await request(app.getHttpServer())
        .post('/movies/sync')
        .set('Authorization', `Bearer ${authTokenAdmin}`)

      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movies = await movieRepository.find();
      expect(movies.length).toBeGreaterThan(0);
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies/sync')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/movies/sync')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Forbidden',
      });
    });
  });
});
