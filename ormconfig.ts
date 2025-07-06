import { DataSource } from 'typeorm';
import { Client } from './src/infrastructure/database/entities/client.entity';
import { User } from './src/infrastructure/database/entities/user.entity';

export default new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: true,
  entities: [Client, User],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts'],
});
