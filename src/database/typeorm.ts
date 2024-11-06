import {config as dotenvConfig} from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({path: '.env'});

const config = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`dist/**/*.entity{.js,.ts}`],
  migrations: [`src/database/migrations/*{.ts,.js}`],
  migrationsRun: true,
  autoLoadEntities: true,
  synchronize: false,
}

const dataSource = new DataSource(config as DataSourceOptions);

export default dataSource;
