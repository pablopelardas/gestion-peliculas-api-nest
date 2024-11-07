import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService,{
        provide: getRepositoryToken(Movie),
        useValue: {
          findOneBy: jest.fn(),
          findOne: jest.fn(),
          find: jest.fn(),
          softDelete: jest.fn(),
          restore: jest.fn(),
        },
      }],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a movie by id', async () => {
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue({
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
      const movie = await service.findOne('2d6a6b00-170d-4980-bad6-e884a37f5d71');
      expect(movie.title).toBe('A New Hope');
    });
    it('should find a movie by title', async () => {
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue({
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
      const movie = await service.findOne('A New Hope');
      expect(movie.title).toBe('A New Hope');
    });
    it('should throw NotFoundException if movie not found', async () => {
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
  describe('remove', () => {
    it('should delete a movie', async () => {
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue({
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
      jest.spyOn(movieRepository, 'softDelete').mockResolvedValue(null);
      const response = await service.remove('2d6a6b00-170d-4980-bad6-e884a37f5d71');
      expect(response).toBe('Movie with id 2d6a6b00-170d-4980-bad6-e884a37f5d71 deleted successfully');
    });
    it('should throw NotFoundException if movie not found', async () => {
      jest.spyOn(movieRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'softDelete').mockResolvedValue(null);
      await expect(service.remove('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
  describe('restore', () => {
    it('should restore a movie', async () => {
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue({
        id: '2d6a6b00-170d-4980-bad6-e884a37f5d71',
        title: 'A New Hope',
        director: 'George Lucas',
        releaseDate: '1977-05-25',
        opening: 'Opening Modified...',
        producer: 'Gary Kurtz, Rick McCallum',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });
      jest.spyOn(movieRepository, 'restore').mockResolvedValue(null);
      const response = await service.restore('2d6a6b00-170d-4980-bad6-e884a37f5d71');
      expect(response).toBe('Movie with id 2d6a6b00-170d-4980-bad6-e884a37f5d71 restored successfully');
    });
    it('should throw NotFoundException if movie not found', async () => {
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'restore').mockResolvedValue(null);
      await expect(service.restore('2d6a6b00-170d-4980-bad6-e884a37f5d71')).rejects.toThrow(NotFoundException);
    });
  });
  describe('listDeleted', () => {
    it('should return list of deleted movies', async () => {
      jest.spyOn(movieRepository, 'find').mockResolvedValue([{
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

      const response = await service.listDeleted();

      expect(response.length).toBe(1);
      expect(response[0].id).toBe('2d6a6b00-170d-4980-bad6-e884a37f5d71');
    });
    it('should return empty array if no deleted movies', async () => {
      jest.spyOn(movieRepository, 'find').mockResolvedValue([]);

      const response = await service.listDeleted();

      expect(response.length).toBe(0);
    });
  });
});
