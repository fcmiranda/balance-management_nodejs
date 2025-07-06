import { Client } from '../src/domain/entities/client';
import type { User } from '../src/domain/entities/auth';
import type { ClientRepository } from '../src/domain/repositories/client-repository';
import type { AuthRepository } from '../src/domain/repositories/auth-repository';
import type { AuthService } from '../src/infrastructure/auth/auth-service';

// Mock Client Repository
export const mockClientRepository = (): jest.Mocked<ClientRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// Mock Auth Repository
export const mockAuthRepository = (): jest.Mocked<AuthRepository> => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
});

// Mock Auth Service
export const mockAuthService = () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  extractTokenFromHeader: jest.fn(),
});

// Test Data Factories
export const createMockClient = (overrides: Partial<Client> = {}): Client => {
  return Client.fromPersistence(
    overrides.id || 1,
    overrides.name || 'Test Client',
    overrides.email || 'test@example.com',
    overrides.balance || 1000
  );
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: overrides.id || 1,
  email: overrides.email || 'test@example.com',
  password: overrides.password || 'hashedPassword',
  role: overrides.role || 'client',
  createdAt: overrides.createdAt || new Date(),
  updatedAt: overrides.updatedAt || new Date(),
});

// Test Client Data
export const testClientData = {
  valid: {
    name: 'John Doe',
    email: 'john@example.com',
    balance: 1000,
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    balance: -100,
  },
};

// Test User Data
export const testUserData = {
  valid: {
    email: 'user@example.com',
    password: 'password123',
    role: 'client' as const,
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  invalid: {
    email: 'invalid-email',
    password: '123',
    role: 'invalid' as any,
  },
};

// JWT Test Tokens
export const testTokens = {
  validClient: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE2MjM5MjQ4MDB9.test',
  validAdmin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMzkyNDgwMH0.test',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE2MjM5MjQ4MDAsImV4cCI6MTYyMzkyNDgwMX0.test',
  invalid: 'invalid.token.here',
};

// Helper to create Express-like request/response mocks
export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to create mock Next function
export const createMockNext = () => jest.fn();
