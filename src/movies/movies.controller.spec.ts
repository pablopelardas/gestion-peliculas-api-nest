import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieSyncService } from './services/movie-sync.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

describe('MoviesController', () => {
  let controller: MoviesController;
  let movieSyncService: MovieSyncService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [MoviesService, {
        provide: MovieSyncService,
        useValue: {
          syncMovies: jest.fn(),
        },
      }]
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieSyncService = module.get<MovieSyncService>(MovieSyncService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('syncMovies', () => {
    it('should call syncMovies method of MovieSyncService', async () => {
      const syncMoviesSpy = jest.spyOn(movieSyncService, 'syncMovies').mockResolvedValue(null);

      await controller.syncMovies();

      expect(syncMoviesSpy).toHaveBeenCalled();
    });

    it('should return 503 if sync is unsuccessful', async () => {
      jest.spyOn(movieSyncService, 'syncMovies').mockRejectedValue(new ServiceUnavailableException('Error syncing movies with external API'));

      await expect(controller.syncMovies()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
