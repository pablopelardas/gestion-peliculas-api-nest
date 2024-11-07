import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { MovieSyncService } from './services/movie-sync.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, MovieSyncService],
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([Movie]),
    AuthModule,
    CommonModule
  ],
})
export class MoviesModule {}
