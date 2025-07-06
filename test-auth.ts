#!/usr/bin/env node

import 'dotenv/config';
import { AuthService } from '../src/infrastructure/auth/auth-service';
import { SQLiteAuthRepository } from '../src/infrastructure/repositories/sqlite-auth-repository';
import { AuthUseCase } from '../src/application/use-cases/auth-use-case';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication...');
  
  try {
    const authService = new AuthService();
    const authRepository = new SQLiteAuthRepository();
    const authUseCase = new AuthUseCase(authRepository, authService);
    
    // Test login
    console.log('📝 Testing login...');
    const loginResult = await authUseCase.login({
      email: 'admin@itau.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResult.token.substring(0, 20) + '...');
    console.log('User:', loginResult.user);
    
    // Test token verification
    console.log('🔐 Testing token verification...');
    const decoded = authService.verifyToken(loginResult.token);
    console.log('✅ Token verified!');
    console.log('Decoded payload:', decoded);
    
    console.log('🎉 Authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

testAuth().then(() => process.exit(0)).catch(console.error);
