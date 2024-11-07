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
  let movieRepository: Repository<Movie>;
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
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));

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

    // Insert movies in the database
    const movies = [
      {
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
      },
      {
        title: 'The Matrix',
        director: 'Andy Wachowski',
        releaseDate: '1999-03-30',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
      },
    ];
    for (const movie of movies) {
      const movieEntity = movieRepository.create({
        title: movie.title,
        director: movie.director,
        releaseDate: movie.releaseDate,
        opening: movie.opening,
        producer: movie.producer,
      });
      await movieRepository.save(movieEntity);
    }

    // Delete movies
    const firstMovie = await movieRepository.findOne({
      where: {
        title: 'A New Hope',
      },
    });
    await movieRepository.softDelete({
      id: firstMovie.id,
    });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  xdescribe('/movies/sync (POST)', () => {
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
  xdescribe('/movies/deleted (GET)', () => {
    it('should list all deleted movies', async () => {
      await request(app.getHttpServer())
        .get('/movies/deleted')
        .set('Authorization', `Bearer ${authTokenAdmin}`)

      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movies = await movieRepository.find();
      expect(movies.length).toBeGreaterThan(0);
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/deleted')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/deleted')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Forbidden',
      });
    });
  });
  xdescribe('/movies/restore/:id (PATCH)', () => {
    it('should restore a deleted movie', async () => {

      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const deletedMovie = await movieRepository.findOne({
        where: {
          title: 'A New Hope',
        },
        withDeleted: true,
      });
      expect(deletedMovie.deletedAt).toBeDefined();
      expect(deletedMovie.deletedAt).not.toBeNull();
      await request(app.getHttpServer())
        .patch(`/movies/restore/${deletedMovie.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)

      const movies = await movieRepository.find();
      expect(movies.length).toBe(2);
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .patch('/movies/restore/2d6a6b00-170d-4980-bad6-e884a37f5d71')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app.getHttpServer())
        .patch('/movies/restore/2d6a6b00-170d-4980-bad6-e884a37f5d71')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Forbidden',
      });
    });
    it('should return 404 if movie not found', async () => {
      const response = await request(app.getHttpServer())
        .patch('/movies/restore/2d6a6b00-170d-4980-bad6-e884a37f5d72')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Movie not found',
      });
    });
  });
  xdescribe('/movies/:query (GET)', () => {
    it('should find a movie by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/The%20Matrix')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'The Matrix');
      expect(response.body).toHaveProperty('deletedAt', null);
    });
    it('should find a movie by id', async () => {
      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movie = await movieRepository.findOne({
        where: {
          title: 'The Matrix',
        },
      });
      expect(movie).toHaveProperty('id')
      const response = await request(app.getHttpServer())
        .get(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenUser}`)

      expect(response.body).toHaveProperty('title', 'The Matrix');
      expect(response.body).toHaveProperty('deletedAt', null);
    });
    it('should not find deleted movies', async () => {
      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movie = await movieRepository.findOne({
        where: {
          title: 'A New Hope',
        },
        withDeleted: true,
      });
      expect(movie.deletedAt).toBeDefined();
      expect(movie.deletedAt).not.toBeNull();
      const response = await request(app.getHttpServer())
        .get(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/The%20Matrix')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
    it('should return NotFoundException if movie not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/I%20Am%20Not%20A%20Movie')
        .set('Authorization', `Bearer ${authTokenUser}`)
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
  describe('/movies/:id (DELETE)', () => {
    it('should delete a movie', async () => {
      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movie = await movieRepository.findOne({
        where: {
          title: 'The Matrix',
        },
      });
      expect(movie.deletedAt).toBeNull();
      await request(app.getHttpServer())
        .delete(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);

      const deletedMovie = await movieRepository.findOne({
        where: {
          title: 'The Matrix',
        },
        withDeleted: true,
      });
      expect(deletedMovie.deletedAt).toBeDefined();
      expect(deletedMovie.deletedAt).not.toBeNull();

    });
    it('should return NotFoundException if movie has already been deleted', async () => {
      const movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
      const movie = await movieRepository.findOne({
        where: {
          title: 'A New Hope',
        },
        withDeleted: true,
      });
      expect(movie.deletedAt).toBeDefined();
      expect(movie.deletedAt).not.toBeNull();
      const response = await request(app.getHttpServer())
        .delete(`/movies/${movie.id}`)
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .delete('/movies/2d6a6b00-170d-4980-bad6-e884a37f5d71')
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app.getHttpServer())
        .delete('/movies/2d6a6b00-170d-4980-bad6-e884a37f5d71')
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
