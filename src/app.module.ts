import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfiguration } from './config/env.config';
import { JoiValidation } from './config/joi-validation.config';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { SeedModule } from './seed/seed.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidation,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: EnvConfiguration().dbHost,
      port: +EnvConfiguration().dbPort,
      username: EnvConfiguration().dbUser,
      password: EnvConfiguration().dbPassword,
      database: EnvConfiguration().dbName,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    MoviesModule,
    SeedModule
  ],
})
export class AppModule {}
