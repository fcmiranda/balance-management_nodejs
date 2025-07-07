import { DataSource } from 'typeorm';
import { Account } from './src/infrastructure/database/entities/account.entity';
import { User } from './src/infrastructure/database/entities/user.entity';

export default new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: true,
  entities: [User, Account],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
});
