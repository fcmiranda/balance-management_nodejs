#!/usr/bin/env ts-node
import 'dotenv/config';
import 'reflect-metadata';
import { AuthService } from '@infrastructure/auth/auth-service';
import { AppDataSource } from '@infrastructure/database/data-source';
import { TypeOrmAuthRepository } from '@infrastructure/repositories/typeorm-auth-repository';

async function setupTypeORM() {
  console.log('🚀 Setting up TypeORM database...');

  try {
    // Initialize TypeORM
    await AppDataSource.initialize();
    console.log('✅ TypeORM initialized successfully');

    // Run migrations if needed
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');

    // Seed initial data
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

  // Create admin user
  const adminEmail = 'admin@itau.com';
  const adminPassword = 'admin123';

  const existingAdmin = await authRepository.findUserByEmail(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await authService.hashPassword(adminPassword);
    await authRepository.createUser('System Admin', adminEmail, hashedPassword, 'admin');
    console.log(`📝 Created admin user: ${adminEmail}`);
  }

  // Create test client user
  const clientEmail = 'client@test.com';
  const clientPassword = 'client123';

  const existingClient = await authRepository.findUserByEmail(clientEmail);
  if (!existingClient) {
    const hashedPassword = await authService.hashPassword(clientPassword);
    await authRepository.createUser('Test Client', clientEmail, hashedPassword, 'client');
    console.log(`📝 Created client user: ${clientEmail}`);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupTypeORM();
}

export { setupTypeORM };
