import express from 'express';
import request from 'supertest';
import { AccountController } from '../../src/controllers/account-controller';
import { NotFoundError } from '../../src/domain/errors/domain-errors';
import { Container } from '../../src/infrastructure/container';

// Mock the Container
jest.mock('../../src/infrastructure/container');

describe('AccountController - createAccount', () => {
  let app: express.Application;
  let accountController: AccountController;
  let mockContainer: any;
  let mockCreateAccountUseCase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateAccountUseCase = {
      execute: jest.fn(),
    };

    mockContainer = {
      getCreateAccountUseCase: jest.fn().mockReturnValue(mockCreateAccountUseCase),
    };

    (Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

    accountController = new AccountController();

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

      const response = await request(app).post('/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
        name: 'John Doe',
        accountType: 'savings',
      });
    });

    it('should create checking account successfully', async () => {
      const requestBody = {
        name: 'John Doe',
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

      const response = await request(app).post('/accounts').send(requestBody).expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 1,
        name: 'John Doe',
        accountType: 'checking',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Create app without auth middleware
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.post('/accounts', (req, res) => {
        accountController.createAccount(req, res);
      });

      const requestBody = {
        name: 'John Doe',
        accountType: 'savings',
      };

      const response = await request(unauthApp).post('/accounts').send(requestBody).expect(401);

      expect(response.body).toEqual({
        error: 'User not authenticated',
      });
      expect(mockCreateAccountUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      const requestBody = {
        name: 'John Doe',
        accountType: 'savings',
      };

      const error = new NotFoundError('User', 1);
      mockCreateAccountUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/accounts').send(requestBody).expect(404);

      expect(response.body).toEqual({
        error: 'User with id 1 not found',
      });
    });

    it('should return 400 for other errors', async () => {
      const requestBody = {
        name: 'John Doe',
        accountType: 'savings',
      };

      const error = new Error('Unable to generate unique account number');
      mockCreateAccountUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/accounts').send(requestBody).expect(400);

      expect(response.body).toEqual({
        error: 'Unable to generate unique account number',
      });
    });

    it('should pass correct user ID from authenticated request', async () => {
      // Setup different user
      const differentUserApp = express();
      differentUserApp.use(express.json());
      differentUserApp.use((req, _res, next) => {
        req.user = { userId: 42, email: 'other@example.com', role: 'client' };
        next();
      });
      differentUserApp.post('/accounts', (req, res) => {
        accountController.createAccount(req, res);
      });

      const requestBody = {
        name: 'Jane Smith',
        accountType: 'checking',
      };

      const expectedResponse = {
        id: 3,
        userId: 42,
        accountNumber: '5555555555',
        balance: 0,
        accountType: 'checking',
        status: 'active',
      };

      mockCreateAccountUseCase.execute.mockResolvedValue(expectedResponse);

      await request(differentUserApp).post('/accounts').send(requestBody).expect(201);

      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({
        userId: 42,
        name: 'Jane Smith',
        accountType: 'checking',
      });
    });
  });
});
