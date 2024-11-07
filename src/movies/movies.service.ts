import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../common/dto/pagination-dto';
import { ConfigService } from '@nestjs/config';
import { ExceptionHandlerService } from '../common/services/exception-handler/exception-handler.service';

@Injectable()
export class MoviesService {
  private readonly DEFAULT_LIMIT: number;
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    configService: ConfigService,
  ) {
    this.DEFAULT_LIMIT = configService.getOrThrow<number>('defaultLimit');
  }

  async create(createMovieDto: CreateMovieDto) {
    try {
      const movie = this.movieRepository.create(createMovieDto);
      return await this.movieRepository.save(movie);
    }catch(error){
      this.exceptionHandlerService.handleException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = this.DEFAULT_LIMIT, offset = 0 } = paginationDto;
      const movies = await this.movieRepository.find({
        take: limit,
        skip: offset,
      });
      return { data: movies, total: await this.count(), limit, offset };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async count() {
    return this.movieRepository.count();
  }

  async findOne(query: string) {
    if (!query) throw new BadRequestException('Query Term is required');
    let movie: Movie;

    if (isUUID(query))
      movie = await this.movieRepository.findOneBy({ id: query });
    else
      movie = await this.movieRepository.findOne({ where: { title: query } });

    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  async listDeleted() {
    return await this.movieRepository.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  async restore(id: string) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      withDeleted: true,
    });

    if (!movie) throw new NotFoundException('Movie not found');

    await this.movieRepository.restore({
      id: id,
    });

    return `Movie with id ${id} restored successfully`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  async remove(id: string) {
    const movie = await this.movieRepository.findOneBy({ id: id });

    if (!movie) throw new NotFoundException('Movie not found');

    await this.movieRepository.softDelete({
      id: id,
    });

    return `Movie with id ${id} deleted successfully`;
  }
}
