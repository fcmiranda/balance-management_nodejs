import 'reflect-metadata';
import { AppDataSource } from './data-source';

export class TypeOrmDatabase {
  private static instance: TypeOrmDatabase;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TypeOrmDatabase {
    if (!TypeOrmDatabase.instance) {
      TypeOrmDatabase.instance = new TypeOrmDatabase();
    }
    return TypeOrmDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await AppDataSource.initialize();
      this.isInitialized = true;
      console.log('TypeORM Data Source has been initialized!');
    } catch (error) {
      console.error('Error during Data Source initialization:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.isInitialized && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      this.isInitialized = false;
      console.log('TypeORM Data Source has been closed!');
    }
  }

  getDataSource() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return AppDataSource;
  }
}
