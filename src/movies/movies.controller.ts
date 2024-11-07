import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators/auth.decorator';
import { MovieSyncService } from './services/movie-sync.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination-dto';
import { PaginatedDataResponse } from '../common/dto/paginated-data-response.dto';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly movieSyncService: MovieSyncService,
  ) {}

  @Post()
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Create a new movie'})
  @ApiResponse({status: 201, description: 'Movie created successfully'})
  @ApiResponse({status: 400, description: 'Invalid data'})
  @ApiResponse({status: 409, description: 'Movie already exists'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOperation({summary: 'Find all movies'})
  @ApiResponse({status: 200, description: 'List of movies'})
  async findAll(@Query() paginationDto: PaginationDto) {
    const {
      data,
      limit,
      offset,
      total,
    } = await this.moviesService.findAll(paginationDto);
    return new PaginatedDataResponse(data, total, limit, offset);
  }

  @Get('deleted')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'List all deleted movies'})
  @ApiResponse({status: 200, description: 'List of deleted movies'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  listDeleted() {
    return this.moviesService.listDeleted();
  }

  @Patch('restore/:id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Restore a deleted movie (ONLY FOR ADMIN)'})
  @ApiResponse({status: 200, description: 'Movie restored successfully'})
  @ApiResponse({status: 404, description: 'Movie not found'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.restore(id);
  }

  @Get(':query')
  @Auth(ValidRoles.USER)
  @ApiOperation({summary: 'Find a movie by title or id'})
  @ApiResponse({status: 200, description: 'Movie found successfully'})
  @ApiResponse({status: 404, description: 'Movie not found'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
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
  @ApiResponse({status: 403, description: 'Forbidden'})
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
  }

  @Post('sync')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({summary: 'Sync movies with external API (ONLY FOR ADMIN)'})
  @ApiResponse({status: 200, description: 'Movies synced successfully'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 403, description: 'Forbidden'})
  @ApiResponse({status: 503, description: 'Service unavailable'})
  async syncMovies() {
    return this.movieSyncService.syncMovies();
  }
}
