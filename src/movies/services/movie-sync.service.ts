import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { Movie } from '../entities/movie.entity';
import { ApiMovie } from '../interfaces/swapi-response.interface';

@Injectable()
export class MovieSyncService {
  private readonly logger = new Logger(MovieSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Execute the job every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncMovies() {
    this.logger.log('Beginning movie sync with external API...');

    try {
      const response$ = this.httpService.get('https://swapi.dev/api/films/');
      const response = await lastValueFrom(response$);
      const movies: ApiMovie[] = response.data.results;

      for (const movie of movies) {
        let movieEntity = await this.movieRepository.findOne({ where: { title: movie.title, director: movie.director } });

        if (!movieEntity) {
          movieEntity = this.movieRepository.create({
            title: movie.title,
            director: movie.director,
            releaseDate: movie.release_date,
            opening: movie.opening_crawl,
            producer: movie.producer,
          });
        } else {
          movieEntity.director = movie.director;
          movieEntity.releaseDate = movie.release_date;
          movieEntity.opening = movie.opening_crawl;
          movieEntity.producer = movie.producer;
          movieEntity.title = movie.title;
        }

        await this.movieRepository.save(movieEntity);
      }

      this.logger.log('Movies synced with external API successfully');
    } catch (error) {
      this.logger.error('Error syncing movies with external API:', error);
    }
  }
}
