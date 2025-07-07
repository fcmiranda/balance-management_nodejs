import express from 'express';
import request from 'supertest';
import { NotFoundError } from '../../src/domain/errors/domain-errors';
import { Container } from '../../src/infrastructure/container';

// Mock the Container and its dependencies
jest.mock('../../src/infrastructure/container');
jest.mock('../../src/infrastructure/auth/auth-service');
jest.mock('../../src/infrastructure/repositories/typeorm-account-repository');
jest.mock('../../src/infrastructure/repositories/typeorm-auth-repository');
jest.mock('../../src/infrastructure/middleware/auth-middleware');

describe('Account Routes Integration - Create Account', () => {
  let app: express.Application;
  let mockContainer: any;
  let mockCreateAccountUseCase: any;

  beforeAll(() => {
    // Setup mock use case
    mockCreateAccountUseCase = {
      execute: jest.fn(),
    };

    // Setup container mock
    mockContainer = {
      getInstance: jest.fn(),
      getCreateAccountUseCase: jest.fn().mockReturnValue(mockCreateAccountUseCase),
      getAuthUseCase: jest.fn(),
      getGetAccountsByUserIdUseCase: jest.fn(),
      getAccountDepositUseCase: jest.fn(),
      getAccountWithdrawUseCase: jest.fn(),
      getUserByIdUseCase: jest.fn(),
      getCreateUserUseCase: jest.fn(),
      getUpdateUserUseCase: jest.fn(),
      getDeleteUserUseCase: jest.fn(),
    };

    (Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

    // Mock auth middleware
    const { AuthMiddleware } = require('../../src/infrastructure/middleware/auth-middleware');
    AuthMiddleware.prototype.authenticate = jest.fn((req, _res, next) => {
      req.user = { userId: 1, email: 'test@example.com', role: 'client' };
      next();
    });
    AuthMiddleware.prototype.authorize = jest.fn(() => (_req, _res, next) => next());

    // Import routes after all mocks are set up
    const { routes } = require('../../src/routes/index');

    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/accounts', () => {
    it('should create savings account successfully', async () => {
      const requestBody = {
        name: 'John Doe',
        accountType: 'savings',
      };

      const expectedResponse = {
        id: 1,
        userId: 1,
        accountNumber: '1234567890',
        balance: 0,
        accountType: 'savings',
        status: 'active',
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/api/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
        name: 'John Doe',
        accountType: 'savings',
      });
    });

    it('should create checking account successfully', async () => {
      const requestBody = {
        name: 'Jane Smith',
        accountType: 'checking',
      };

      const expectedResponse = {
        id: 2,
        userId: 1,
        accountNumber: '0987654321',
        balance: 0,
        accountType: 'checking',
        status: 'active',
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/api/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
        name: 'Jane Smith',
        accountType: 'checking',
      });
    });

    it('should return 400 for validation errors', async () => {
      const requestBody = {
        name: '', // Invalid name
        accountType: 'invalid', // Invalid account type
      };

      const response = await request(app).post('/api/accounts').send(requestBody).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(mockCreateAccountUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      const requestBody = {
        name: 'John Doe',
        accountType: 'savings',
      };

      const error = new NotFoundError('User', 1);
      mockCreateAccountUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/api/accounts').send(requestBody).expect(404);

      expect(response.body).toEqual({
        error: 'User with id 1 not found',
      });
    });
  });
});
