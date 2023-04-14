import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './entities/User';
import { join } from 'path';

type DbType = 'postgres' | 'mysql';

const env = process.env.NODE_ENV || 'development';

const defaultDbConfig: DataSourceOptions = {
  type: 'sqlite',
  database: join(__dirname, '../database/db.sqlite'),
};

const dbConfig: DataSourceOptions = {
  type: process.env.DB_TYPE as DbType,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export const AppDataSource = new DataSource({
  ...(process.env.DB_TYPE ? dbConfig : defaultDbConfig),
  synchronize: env === 'development',
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
