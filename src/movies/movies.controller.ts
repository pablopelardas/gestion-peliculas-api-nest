import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
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

  @Get('deleted')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'List all deleted movies'})
  @ApiResponse({status: 200, description: 'List of deleted movies'})
  listDeleted() {
    return this.moviesService.listDeleted();
  }

  @Patch('restore/:id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Restore a deleted movie (ONLY FOR ADMIN)'})
  @ApiResponse({status: 200, description: 'Movie restored successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Movie not found'})
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.restore(id);
  }

  @Get(':query')
  @Auth(ValidRoles.USER)
  @ApiOperation({summary: 'Find a movie by title or id'})
  @ApiResponse({status: 200, description: 'Movie found successfully'})
  @ApiResponse({status: 404, description: 'Movie not found'})
  findOne(@Param('query') query: string) {
    return this.moviesService.findOne(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Delete a movie (ONLY FOR ADMIN)'})
  @ApiResponse({status: 200, description: 'Movie deleted successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
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
