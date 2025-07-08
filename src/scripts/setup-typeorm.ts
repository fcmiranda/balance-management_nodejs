#!/usr/bin/env ts-node
import 'dotenv/config';
import 'reflect-metadata';
import { AuthService } from '@infrastructure/auth/auth-service';
import { AppDataSource } from '@infrastructure/database/data-source';
import { TypeOrmAuthRepository } from '@infrastructure/repositories/typeorm-auth-repository';

async function setupTypeORM() {
  console.log('🚀 Setting up TypeORM database...');

  try {
    await AppDataSource.initialize();
    console.log('✅ TypeORM initialized successfully');

    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');

    await seedInitialData();
    console.log('✅ Initial data seeded');

    console.log('🎉 TypeORM setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up TypeORM:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

async function seedInitialData() {
  const authRepository = new TypeOrmAuthRepository();
  const authService = new AuthService();

  const adminEmail = 'admin@itau.com';
  const adminPassword = 'admin123';

  const existingAdmin = await authRepository.findUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await authService.hashPassword(adminPassword);
    await authRepository.createUser('System Admin', adminEmail, hashedPassword, 'admin');
    console.log(`📝 Created admin user: ${adminEmail}`);
  }

  const clientEmail = 'client@test.com';
  const clientPassword = 'client123';

  const existingClient = await authRepository.findUserByEmail(clientEmail);
  if (!existingClient) {
    const hashedPassword = await authService.hashPassword(clientPassword);
    await authRepository.createUser('Test Client', clientEmail, hashedPassword, 'client');
    console.log(`📝 Created client user: ${clientEmail}`);
  }
}

if (require.main === module) {
  setupTypeORM();
}

export { setupTypeORM };
