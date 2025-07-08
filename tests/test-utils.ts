import type { User } from '../src/domain/entities/auth';
import type { AuthRepository } from '../src/domain/repositories/auth-repository';
import type { AuthService } from '../src/infrastructure/auth/auth-service';

export const mockAuthRepository = (): jest.Mocked<AuthRepository> => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
});

export const mockAuthService = () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  extractTokenFromHeader: jest.fn(),
});

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

export const testUserData = {
  valid: {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password123',
    role: 'client' as const,
  },
  admin: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123123',
    role: 'admin' as const,
  },
  invalid: {
    name: 'Invalid User',
    email: 'invalid-email',
    password: '123',
    role: 'invalid' as const,
  },
};

export const testTokens = {
  validClient:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE2MjM5MjQ4MDB9.test',
  validAdmin:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMzkyNDgwMH0.test',
  expired:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJjbGllbnQiLCJpYXQiOjE2MjM5MjQ4MDAsImV4cCI6MTYyMzkyNDgwMX0.test',
  invalid: 'invalid.token.here',
};

interface MockRequest {
  body: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  user?: unknown;
  path?: string;
  originalUrl?: string;
  [key: string]: unknown;
}

export const createMockRequest = (overrides: Partial<MockRequest> = {}): MockRequest => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  path: '/test',
  originalUrl: '/test',
  ...overrides,
});

interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
}

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: overrides.id || 1,
  name: overrides.name || 'Test User',
  email: overrides.email || 'test@example.com',
  password: overrides.password || 'hashedPassword',
  role: overrides.role || 'client',
  createdAt: overrides.createdAt || new Date(),
  updatedAt: overrides.updatedAt || new Date(),
});

export const createMockResponse = (): MockResponse => {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();
