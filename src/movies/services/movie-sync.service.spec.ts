import { Test, TestingModule } from '@nestjs/testing';
import { MovieSyncService } from './movie-sync.service';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../entities/movie.entity';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';

describe('MovieSyncService', () => {
  let service: MovieSyncService;
  let httpService: HttpService;
  let movieRepository: Repository<Movie>;

  const mockMovieRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieSyncService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MovieSyncService>(MovieSyncService);
    httpService = module.get<HttpService>(HttpService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncMovies', () => {
    it('should sync movies successfully', async () => {
      const mockMovies = [
        {
          title: 'A New Hope',
          director: 'George Lucas',
          release_date: '1977-05-25',
          opening_crawl: 'It is a period of civil war...',
          producer: 'Gary Kurtz, Rick McCallum',
        },
      ];

      mockHttpService.get.mockReturnValue(of({ data: { results: mockMovies } }));
      mockMovieRepository.findOne.mockResolvedValue(null);
      mockMovieRepository.create.mockImplementation((movie) => movie);
      mockMovieRepository.save.mockResolvedValue(null);

      await service.syncMovies();

      expect(mockHttpService.get).toHaveBeenCalledWith('https://swapi.dev/api/films/');
      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { title: 'A New Hope', director: 'George Lucas' },
        withDeleted: true
      });
      expect(mockMovieRepository.create).toHaveBeenCalledWith({
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'It is a period of civil war...',
        producer: 'Gary Kurtz, Rick McCallum',
      });
      expect(mockMovieRepository.save).toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when the API fails', async () => {
      mockHttpService.get.mockReturnValue(throwError(() => new Error('API Error')));

      await expect(service.syncMovies()).rejects.toThrow(ServiceUnavailableException);

      expect(mockHttpService.get).toHaveBeenCalledWith('https://swapi.dev/api/films/');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error syncing movies with external API:',
        expect.any(Error),
      );
    });

    it('should update existing movie with api data', async () => {
      const mockMovies = [
        {
          title: 'A New Hope',
          director: 'George Lucas',
          release_date: '1977-05-25',
          opening_crawl: 'It is a period of civil war...',
          producer: 'Gary Kurtz, Rick McCallum',
        },
      ];

      mockHttpService.get.mockReturnValue(of({ data: { results: mockMovies } }));
      mockMovieRepository.findOne.mockResolvedValue({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
      });

      mockMovieRepository.save.mockResolvedValue(null);

      await service.syncMovies();

      expect(mockHttpService.get).toHaveBeenCalledWith('https://swapi.dev/api/films/');
      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { title: 'A New Hope', director: 'George Lucas' },
        withDeleted: true
      });
      expect(mockMovieRepository.save).toHaveBeenCalledWith({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'It is a period of civil war...',
        producer: 'Gary Kurtz, Rick McCallum',
      });
      expect(Logger.prototype.log).toHaveBeenCalledWith('Movies synced with external API successfully');
    });
  });
});
