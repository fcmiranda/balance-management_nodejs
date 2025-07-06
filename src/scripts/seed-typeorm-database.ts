import 'reflect-metadata';
import { AuthService } from '../infrastructure/auth/auth-service';
import { TypeOrmDatabase } from '../infrastructure/database/typeorm-database';
import { TypeOrmAuthRepository } from '../infrastructure/repositories/typeorm-auth-repository';

async function seedTypeOrmDatabase() {
  console.log('🌱 Seeding TypeORM database...');

  try {
    // Initialize TypeORM database
    const database = TypeOrmDatabase.getInstance();
    await database.initialize();

    const authRepository = new TypeOrmAuthRepository();
    const authService = new AuthService();

    // Create admin user
    const adminEmail = 'admin@itau.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await authRepository.findUserByEmail(adminEmail);

    if (!existingAdmin) {
      const hashedPassword = await authService.hashPassword(adminPassword);
      await authRepository.createUser(adminEmail, hashedPassword, 'admin');
      console.log('✅ Admin user created successfully');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create test client user
    const clientEmail = 'client@test.com';
    const clientPassword = 'client123';

    const existingClient = await authRepository.findUserByEmail(clientEmail);

    if (!existingClient) {
      const hashedPassword = await authService.hashPassword(clientPassword);
      await authRepository.createUser(clientEmail, hashedPassword, 'client');
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

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedTypeOrmDatabase();
}

export { seedTypeOrmDatabase };
