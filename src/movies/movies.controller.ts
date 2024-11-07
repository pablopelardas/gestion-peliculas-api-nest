import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators/auth.decorator';
import { MovieSyncService } from './services/movie-sync.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly movieSyncService: MovieSyncService,
  ) {}

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }

  @Post('sync')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Sync movies with external API (ONLY FOR ADMIN)'})
  @ApiResponse({status: 200, description: 'Movies synced successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 503, description: 'Service unavailable'})
  async syncMovies() {
    return this.movieSyncService.syncMovies();
  }
}
