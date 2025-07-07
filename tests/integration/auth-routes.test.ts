import express from 'express';
import request from 'supertest';
import { Container } from '../../src/infrastructure/container';
import { testUserData } from '../test-utils';

// Mock ALL dependencies before importing anything
jest.mock('../../src/infrastructure/container');
jest.mock('../../src/infrastructure/auth/auth-service');
jest.mock('../../src/infrastructure/repositories/typeorm-account-repository');
jest.mock('../../src/infrastructure/repositories/typeorm-auth-repository');
jest.mock('../../src/application/use-cases/auth-use-case');

// Create a comprehensive mock container
const mockAuthUseCase = {
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn(),
};

const mockContainer = {
  getAuthUseCase: jest.fn().mockReturnValue(mockAuthUseCase),
  getCreateAccountUseCase: jest.fn(),
  getGetAccountsByUserIdUseCase: jest.fn(),
  getAccountDepositUseCase: jest.fn(),
  getAccountWithdrawUseCase: jest.fn(),
  getUserByIdUseCase: jest.fn(),
  getCreateUserUseCase: jest.fn(),
  getUpdateUserUseCase: jest.fn(),
  getDeleteUserUseCase: jest.fn(),
};

// Mock Container.getInstance to return our mock container
const MockedContainer = Container as jest.Mocked<typeof Container>;
MockedContainer.getInstance = jest.fn().mockReturnValue(mockContainer);

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

      const response = await request(app).post('/api/auth/login').send(loginData).expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'Invalid credentials',
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const registerData = testUserData.valid;
      const authResponse = {
        token: 'jwt-token',
        user: {
          id: 1,
          name: registerData.name,
          email: registerData.email,
          role: registerData.role,
        },
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

      const response = await request(app).post('/api/auth/register').send(registerData).expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'User already exists',
      });
    });
  });
});
