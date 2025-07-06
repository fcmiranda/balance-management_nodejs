import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Account } from './entities/account.entity';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Account],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
});
