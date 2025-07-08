#!/usr/bin/env ts-node
import 'dotenv/config';
import 'reflect-metadata';
import { AuthService } from '@infrastructure/auth/auth-service';
import { TypeOrmDatabase } from '@infrastructure/database/typeorm-database';
import { TypeOrmAuthRepository } from '@infrastructure/repositories/typeorm-auth-repository';

async function seedTypeOrmDatabase() {
  console.log('🌱 Seeding TypeORM database...');

  try {
    const database = TypeOrmDatabase.getInstance();
    await database.initialize();

    const authRepository = new TypeOrmAuthRepository();
    const authService = new AuthService();

    const adminEmail = 'admin@admin.com';
    const adminPassword = '123123';

    const existingAdmin = await authRepository.findUserByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = await authService.hashPassword(adminPassword);
      await authRepository.createUser('System Admin', adminEmail, hashedPassword, 'admin');
      console.log('✅ Admin user created successfully');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    const clientEmail = 'client@test.com';
    const clientPassword = '123123';

    const existingClient = await authRepository.findUserByEmail(clientEmail);

    if (!existingClient) {
      const hashedPassword = await authService.hashPassword(clientPassword);
      await authRepository.createUser('Test Client', clientEmail, hashedPassword, 'client');
      console.log('✅ Test client user created successfully');
      console.log(`Email: ${clientEmail}`);
      console.log(`Password: ${clientPassword}`);
    } else {
      console.log('ℹ️  Test client user already exists');
    }

    console.log('🎉 TypeORM database seeding completed!');
    await database.close();
  } catch (error) {
    console.error('❌ Error seeding TypeORM database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedTypeOrmDatabase();
}

export { seedTypeOrmDatabase };
