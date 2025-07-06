import 'dotenv/config';
import { AuthService } from '../infrastructure/auth/auth-service';
import { Database } from '../infrastructure/database/database';
import { SQLiteAuthRepository } from '../infrastructure/repositories/sqlite-auth-repository';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Initialize database
    Database.getInstance();

    const authRepository = new SQLiteAuthRepository();
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

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    Database.getInstance().close();
    process.exit(0);
  }
}

seedDatabase();
