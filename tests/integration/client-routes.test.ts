import request from 'supertest';
import express from 'express';
import { Container } from '../../src/infrastructure/container';
import { createMockClient } from '../test-utils';

// Mock the Container and its dependencies
jest.mock('../../src/infrastructure/container');
jest.mock('../../src/infrastructure/auth/auth-service');
jest.mock('../../src/infrastructure/repositories/typeorm-client-repository');

// Setup container mock
const mockContainer = {
  getGetAllClientsUseCase: jest.fn(),
  getCreateClientUseCase: jest.fn(),
  getDepositUseCase: jest.fn(),
  getWithdrawUseCase: jest.fn(),
};

(Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

// Import routes after mocking
import { routes } from '../../src/routes/index';

describe('Client Routes Integration', () => {
  let app: express.Application;
  let mockGetAllClientsUseCase: any;
  let mockCreateClientUseCase: any;
  let mockDepositUseCase: any;
  let mockWithdrawUseCase: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', routes);
  });

  beforeEach(() => {
    mockGetAllClientsUseCase = {
      execute: jest.fn(),
    };
    mockCreateClientUseCase = {
      execute: jest.fn(),
    };
    mockDepositUseCase = {
      execute: jest.fn(),
    };
    mockWithdrawUseCase = {
      execute: jest.fn(),
    };

    mockContainer.getGetAllClientsUseCase.mockReturnValue(mockGetAllClientsUseCase);
    mockContainer.getCreateClientUseCase.mockReturnValue(mockCreateClientUseCase);
    mockContainer.getDepositUseCase.mockReturnValue(mockDepositUseCase);
    mockContainer.getWithdrawUseCase.mockReturnValue(mockWithdrawUseCase);
    
    jest.clearAllMocks();
  });

  describe('GET /api/clients', () => {
    it('should get all clients', async () => {
      const clients = [
        { id: 1, name: 'John Doe', email: 'john@example.com', balance: 1000 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', balance: 2000 },
      ];

      mockGetAllClientsUseCase.execute.mockResolvedValue(clients);

      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body).toEqual(clients);
      expect(mockGetAllClientsUseCase.execute).toHaveBeenCalled();
    });

    it('should handle empty client list', async () => {
      mockGetAllClientsUseCase.execute.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockGetAllClientsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      const clientData = { name: 'John Doe', email: 'john@example.com' };
      const createdClient = { id: 1, name: 'John Doe', email: 'john@example.com', balance: 0 };

      mockCreateClientUseCase.execute.mockResolvedValue(createdClient);

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(201);

      expect(response.body).toEqual(createdClient);
      expect(mockCreateClientUseCase.execute).toHaveBeenCalledWith(clientData);
    });

    it('should return 400 for duplicate email', async () => {
      const clientData = { name: 'John Doe', email: 'john@example.com' };
      const error = new Error('Client already exists');

      mockCreateClientUseCase.execute.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Client creation failed',
        message: 'Client already exists',
      });
    });
  });

  describe('POST /api/clients/:id/deposit', () => {
    it('should deposit funds to client account', async () => {
      const clientId = 1;
      const depositData = { amount: 500 };
      const updatedClient = { id: 1, name: 'John Doe', email: 'john@example.com', balance: 1500 };

      mockDepositUseCase.execute.mockResolvedValue(updatedClient);

      const response = await request(app)
        .post(`/api/clients/${clientId}/deposit`)
        .send(depositData)
        .expect(200);

      expect(response.body).toEqual(updatedClient);
      expect(mockDepositUseCase.execute).toHaveBeenCalledWith({ clientId, amount: 500 });
    });

    it('should return 400 for invalid amount', async () => {
      const clientId = 1;
      const depositData = { amount: -100 };
      const error = new Error('Invalid deposit amount');

      mockDepositUseCase.execute.mockRejectedValue(error);

      const response = await request(app)
        .post(`/api/clients/${clientId}/deposit`)
        .send(depositData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Deposit failed',
        message: 'Invalid deposit amount',
      });
    });
  });

  describe('POST /api/clients/:id/withdraw', () => {
    it('should withdraw funds from client account', async () => {
      const clientId = 1;
      const withdrawData = { amount: 300 };
      const updatedClient = { id: 1, name: 'John Doe', email: 'john@example.com', balance: 700 };

      mockWithdrawUseCase.execute.mockResolvedValue(updatedClient);

      const response = await request(app)
        .post(`/api/clients/${clientId}/withdraw`)
        .send(withdrawData)
        .expect(200);

      expect(response.body).toEqual(updatedClient);
      expect(mockWithdrawUseCase.execute).toHaveBeenCalledWith({ clientId, amount: 300 });
    });

    it('should return 400 for insufficient funds', async () => {
      const clientId = 1;
      const withdrawData = { amount: 2000 };
      const error = new Error('Insufficient funds');

      mockWithdrawUseCase.execute.mockRejectedValue(error);

      const response = await request(app)
        .post(`/api/clients/${clientId}/withdraw`)
        .send(withdrawData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Withdrawal failed',
        message: 'Insufficient funds',
      });
    });
  });
});
