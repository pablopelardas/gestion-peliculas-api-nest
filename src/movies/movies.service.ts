import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {validate as isUUID} from 'uuid';

@Injectable()
export class MoviesService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  create(createMovieDto: CreateMovieDto) {
    return 'This action adds a new movie';
  }

  findAll() {
    return `This action returns all movies`;
  }

  async findOne(query: string) {
    if (!query) throw new BadRequestException('Query Term is required');
    let movie: Movie;

    if (isUUID(query)) movie = await this.movieRepository.findOneBy({ id: query })
    else movie = await this.movieRepository.findOne({ where: { title: query } });

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
      // soft delete
    const movie = await this.movieRepository.findOneBy({ id: id });

    if (!movie) throw new NotFoundException('Movie not found');

    await this.movieRepository.softDelete({
      id: id,
    });

    return `Movie with id ${id} deleted successfully`;

  }
}
