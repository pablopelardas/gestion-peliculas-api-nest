import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieSyncService } from './services/movie-sync.service';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

describe('MoviesController', () => {
  let controller: MoviesController;
  let movieSyncService: MovieSyncService;
  let moviesService: MoviesService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        {
        provide: MovieSyncService,
        useValue: {
          syncMovies: jest.fn(),
        },
        },
        {
          provide: MoviesService,
          useValue: {
            findOne: jest.fn(),
            remove: jest.fn(),
            listDeleted: jest.fn(),
            restore: jest.fn(),
          },
        },
        ]
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieSyncService = module.get<MovieSyncService>(MovieSyncService);
    moviesService = module.get<MoviesService>(MoviesService);
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
  describe('remove', () => {
    it('should call remove method of MoviesService', async () => {
      const removeSpy = jest.spyOn(moviesService, 'remove').mockResolvedValue(null);

      await controller.remove('2d6a6b00-170d-4980-bad6-e884a37f5d71');

      expect(removeSpy).toHaveBeenCalledWith('2d6a6b00-170d-4980-bad6-e884a37f5d71');
    });
    it('should return NotFoundException if movie not found', async () => {
      jest.spyOn(moviesService, 'remove').mockRejectedValue(new NotFoundException('Movie not found'));

      await expect(controller.remove('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
  describe('listDeleted', () => {
    it('should call listDeleted method of MoviesService', async () => {
      const listDeletedSpy = jest.spyOn(moviesService, 'listDeleted').mockResolvedValue([{
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      }]);

      await controller.listDeleted();

      expect(listDeletedSpy).toHaveBeenCalled();
    });
    it('should return list of deleted movies', async () => {
      jest.spyOn(moviesService, 'listDeleted').mockResolvedValue([{
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      }]);

      const response = await controller.listDeleted();

      expect(response.length).toBe(1);
      expect(response[0].id).toBe('2d6a6b00-170d-4980-bad6-e884a37f5d71');
    });
    it('should return empty array if no deleted movies', async () => {
      jest.spyOn(moviesService, 'listDeleted').mockResolvedValue([]);

      const response = await controller.listDeleted();

      expect(response.length).toBe(0);
    });
  });

  describe('restore', () => {
    it('should call restore method of MoviesService', async () => {
      const restoreSpy = jest.spyOn(moviesService, 'restore').mockResolvedValue(null);

      await controller.restore('2d6a6b00-170d-4980-bad6-e884a37f5d71');

      expect(restoreSpy).toHaveBeenCalledWith('2d6a6b00-170d-4980-bad6-e884a37f5d71');
    });
    it('should return NotFoundException if movie not found', async () => {
      jest.spyOn(moviesService, 'restore').mockRejectedValue(new NotFoundException('Movie not found'));

      await expect(controller.restore('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
  describe('findOne', () => {
    it('should call findOne method of MoviesService', async () => {
      const findOneSpy = jest.spyOn(moviesService, 'findOne').mockResolvedValue({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await controller.findOne('2d6a6b00-170d-4980-bad6-e884a37f5d71');

      expect(findOneSpy).toHaveBeenCalledWith('2d6a6b00-170d-4980-bad6-e884a37f5d71');
    });
    it('should return NotFoundException if movie not found', async () => {
      jest.spyOn(moviesService, 'findOne').mockRejectedValue(new NotFoundException('Movie not found'));

      await expect(controller.findOne('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
});
