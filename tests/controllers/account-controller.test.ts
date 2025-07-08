import express from 'express';
import request from 'supertest';
import { AccountController } from '../../src/controllers/account-controller';
import { NotFoundError } from '../../src/domain/errors/domain-errors';

describe('AccountController - createAccount', () => {
  let app: express.Application;
  let accountController: AccountController;
  let mockCreateAccountUseCase: any;
  let mockGetAccountsByUserIdUseCase: any;
  let mockAccountDepositUseCase: any;
  let mockAccountWithdrawUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateAccountUseCase = {
      execute: jest.fn(),
    };

    mockGetAccountsByUserIdUseCase = {
      execute: jest.fn(),
    };

    mockAccountDepositUseCase = {
      execute: jest.fn(),
    };

    mockAccountWithdrawUseCase = {
      execute: jest.fn(),
    };

    accountController = new AccountController(
      mockCreateAccountUseCase,
      mockGetAccountsByUserIdUseCase,
      mockAccountDepositUseCase,
      mockAccountWithdrawUseCase,
    );

    // Setup Express app for testing
    app = express();
    app.use(express.json());

    // Add middleware to simulate authenticated user
    app.use((req, _res, next) => {
      req.user = { userId: 1, email: 'test@example.com', role: 'client' };
      next();
    });

    app.post('/accounts', (req, res) => {
      accountController.createAccount(req, res);
    });
  });

  describe('POST /accounts', () => {
    it('should create account successfully', async () => {
      const requestBody = {};

      const currentDate = new Date();
      const expectedResponse = {
        id: 1,
        userId: 1,
        accountNumber: '1234567890',
        balance: 0,
        createdAt: currentDate,
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual({
        id: 1,
        userId: 1,
        accountNumber: '1234567890',
        balance: 0,
        createdAt: currentDate.toISOString(),
      });
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
      });
    });

    it('should create checking account successfully', async () => {
      const requestBody = {};

      const currentDate = new Date();
      const expectedResponse = {
        id: 2,
        userId: 1,
        accountNumber: '0987654321',
        balance: 0,
        createdAt: currentDate,
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      const response = await request(app).post('/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual({
        id: 2,
        userId: 1,
        accountNumber: '0987654321',
        balance: 0,
        createdAt: currentDate.toISOString(),
      });
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Create app without auth middleware
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.post('/accounts', (req, res) => {
        accountController.createAccount(req, res);
      });

      const requestBody = {};

      const response = await request(unauthApp).post('/accounts').send(requestBody).expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required',
        message: 'User not authenticated',
        path: '/accounts',
        timestamp: expect.any(String),
      });
      expect(mockCreateAccountUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      const requestBody = {};

      const error = new NotFoundError('User', 1);
      mockCreateAccountUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/accounts').send(requestBody).expect(404);

      expect(response.body).toEqual({
        error: 'Resource not found',
        message: 'User with id 1 not found',
        path: '/accounts',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 for other errors', async () => {
      const requestBody = {};

      const error = new Error('Unable to generate unique account number');
      mockCreateAccountUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/accounts').send(requestBody).expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error',
        message: 'Unable to generate unique account number',
        path: '/accounts',
        timestamp: expect.any(String),
      });
    });

    it('should pass correct user ID from authenticated request', async () => {
      // Setup different user
      const differentUserApp = express();
      differentUserApp.use(express.json());
      differentUserApp.use((req, _res, next) => {
        (req as any).user = { userId: 42, email: 'other@example.com', role: 'client' };
        next();
      });
      differentUserApp.post('/accounts', (req, res) => {
        accountController.createAccount(req, res);
      });

      const requestBody = {};

      const expectedResponse = {
        id: 3,
        userId: 42,
        accountNumber: '5555555555',
        balance: 0,
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      await request(differentUserApp).post('/accounts').send(requestBody).expect(201);

      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 42,
      });
    });
  });
});
