import express from 'express';
import request from 'supertest';
import { testUserData } from '../test-utils';

// Mock the Container and its dependencies BEFORE importing anything else
jest.mock('../../src/infrastructure/container');
jest.mock('../../src/infrastructure/auth/auth-service');
jest.mock('../../src/infrastructure/repositories/typeorm-client-repository');
jest.mock('../../src/infrastructure/repositories/typeorm-auth-repository');

// Import Container after mocking
import { Container } from '../../src/infrastructure/container';

// Setup mock auth use case
const mockAuthUseCase = {
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn(),
};

// Setup container mock
const mockContainer = {
  getInstance: jest.fn(),
  getAuthUseCase: jest.fn().mockReturnValue(mockAuthUseCase),
  getGetAllClientsUseCase: jest.fn(),
  getCreateClientUseCase: jest.fn(),
  getDepositUseCase: jest.fn(),
  getWithdrawUseCase: jest.fn(),
  getGetClientByIdUseCase: jest.fn(),
  getUpdateClientUseCase: jest.fn(),
  getDeleteClientUseCase: jest.fn(),
} as unknown;

// Mock the Container getInstance method
(Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

// Import routes after all mocks are set up
import { routes } from '../../src/routes/index';

describe('Auth Routes Integration', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const authResponse = {
        token: 'jwt-token',
        user: { id: 1, email: 'test@example.com', role: 'client' },
      };

      mockAuthUseCase.login.mockResolvedValue(authResponse);

      const response = await request(app).post('/api/auth/login').send(loginData).expect(200);

      expect(response.body).toEqual(authResponse);
      expect(mockAuthUseCase.login).toHaveBeenCalledWith(loginData);
    });

    it('should return 400 for invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      const error = new Error('Invalid credentials');

      mockAuthUseCase.login.mockRejectedValue(error);

      const response = await request(app).post('/api/auth/login').send(loginData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Login failed',
        message: 'Invalid credentials',
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const registerData = testUserData.valid;
      const authResponse = {
        token: 'jwt-token',
        user: { id: 1, email: registerData.email, role: registerData.role },
      };

      mockAuthUseCase.register.mockResolvedValue(authResponse);

      const response = await request(app).post('/api/auth/register').send(registerData).expect(201);

      expect(response.body).toEqual(authResponse);
      expect(mockAuthUseCase.register).toHaveBeenCalledWith(registerData);
    });

    it('should return 400 for duplicate email', async () => {
      const registerData = testUserData.valid;
      const error = new Error('User already exists');

      mockAuthUseCase.register.mockRejectedValue(error);

      const response = await request(app).post('/api/auth/register').send(registerData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Registration failed',
        message: 'User already exists',
      });
    });
  });
});
