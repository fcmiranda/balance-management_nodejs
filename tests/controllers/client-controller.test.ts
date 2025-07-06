import { ClientController } from '../../src/controllers/client-controller';
import { Container } from '../../src/infrastructure/container';
import { createMockRequest, createMockResponse, createMockClient, testClientData } from '../test-utils';
import { NotFoundError, DuplicateError } from '../../src/domain/errors/domain-errors';

// Mock the Container
jest.mock('../../src/infrastructure/container');

describe('ClientController', () => {
  let controller: ClientController;
  let mockContainer: jest.Mocked<Container>;
  let mockUseCases: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockUseCases = {
      getGetAllClientsUseCase: jest.fn(),
      getGetClientByIdUseCase: jest.fn(),
      getCreateClientUseCase: jest.fn(),
      getUpdateClientUseCase: jest.fn(),
      getDeleteClientUseCase: jest.fn(),
      getDepositUseCase: jest.fn(),
      getWithdrawUseCase: jest.fn(),
    };

    mockContainer = {
      getInstance: jest.fn(),
      ...mockUseCases,
    } as any;

    (Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

    Object.keys(mockUseCases).forEach(key => {
      mockContainer[key as keyof Container] = mockUseCases[key];
    });

    controller = new ClientController();
    req = createMockRequest();
    res = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllClients', () => {
    it('should return all clients', async () => {
      const clients = [
        createMockClient({ id: 1, name: 'John Doe' }),
        createMockClient({ id: 2, name: 'Jane Doe' }),
      ];
      const mockUseCase = { execute: jest.fn().mockResolvedValue(clients) };
      mockContainer.getGetAllClientsUseCase.mockReturnValue(mockUseCase);

      await controller.getAllClients(req, res);

      expect(mockContainer.getGetAllClientsUseCase).toHaveBeenCalled();
      expect(mockUseCase.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(clients);
    });

    it('should handle error and return 400', async () => {
      const error = new Error('Database error');
      const mockUseCase = { execute: jest.fn().mockRejectedValue(error) };
      mockContainer.getGetAllClientsUseCase.mockReturnValue(mockUseCase);

      await controller.getAllClients(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getClientById', () => {
    it('should return client by id', async () => {
      const client = createMockClient({ id: 1, name: 'John Doe' });
      const mockUseCase = { execute: jest.fn().mockResolvedValue(client) };
      mockContainer.getGetClientByIdUseCase.mockReturnValue(mockUseCase);

      req.params.id = '1';

      await controller.getClientById(req, res);

      expect(mockContainer.getGetClientByIdUseCase).toHaveBeenCalled();
      expect(mockUseCase.execute).toHaveBeenCalledWith({ id: 1 });
      expect(res.json).toHaveBeenCalledWith(client);
    });

    it('should return 404 if client not found', async () => {
      const mockUseCase = { execute: jest.fn().mockResolvedValue(null) };
      mockContainer.getGetClientByIdUseCase.mockReturnValue(mockUseCase);

      req.params.id = '999';

      await controller.getClientById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Client not found' });
    });

    it('should handle error and return 400', async () => {
      req.params.id = 'invalid';
      const mockUseCase = { execute: jest.fn().mockRejectedValue(new Error('Invalid client ID')) };
      mockContainer.getGetClientByIdUseCase.mockReturnValue(mockUseCase);

      await controller.getClientById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid client ID' });
    });
  });

  describe('createClient', () => {
    it('should create client with valid data', async () => {
      const client = createMockClient({ name: 'John Doe', email: 'john@example.com' });
      const mockUseCase = { execute: jest.fn().mockResolvedValue(client) };
      mockContainer.getCreateClientUseCase.mockReturnValue(mockUseCase);

      req.body = { name: 'John Doe', email: 'john@example.com' };

      await controller.createClient(req, res);

      expect(mockContainer.getCreateClientUseCase).toHaveBeenCalled();
      expect(mockUseCase.execute).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(client);
    });

    it('should handle duplicate email error', async () => {
      const error = new DuplicateError('Client', 'email', 'john@example.com');
      const mockUseCase = { execute: jest.fn().mockRejectedValue(error) };
      mockContainer.getCreateClientUseCase.mockReturnValue(mockUseCase);

      req.body = testClientData.valid;

      await controller.createClient(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should handle validation error', async () => {
      req.body = { name: 'A', email: 'invalid-email' };
      const mockUseCase = { execute: jest.fn().mockRejectedValue(new Error('Invalid client data')) };
      mockContainer.getCreateClientUseCase.mockReturnValue(mockUseCase);

      await controller.createClient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid client data' });
    });
  });

  describe('deposit', () => {
    it('should deposit amount to client account', async () => {
      const client = createMockClient({ id: 1, balance: 1500 });
      const mockUseCase = { execute: jest.fn().mockResolvedValue(client) };
      mockContainer.getDepositUseCase.mockReturnValue(mockUseCase);

      req.params.id = '1';
      req.body = { amount: 500 };

      await controller.deposit(req, res);

      expect(mockContainer.getDepositUseCase).toHaveBeenCalled();
      expect(mockUseCase.execute).toHaveBeenCalledWith({ clientId: 1, amount: 500 });
      expect(res.json).toHaveBeenCalledWith(client);
    });

    it('should handle client not found error', async () => {
      const error = new NotFoundError('Client', 999);
      const mockUseCase = { execute: jest.fn().mockRejectedValue(error) };
      mockContainer.getDepositUseCase.mockReturnValue(mockUseCase);

      req.params.id = '999';
      req.body = { amount: 500 };

      await controller.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it('should handle invalid amount error', async () => {
      req.params.id = '1';
      req.body = { amount: -100 };
      const mockUseCase = { execute: jest.fn().mockRejectedValue(new Error('Invalid amount')) };
      mockContainer.getDepositUseCase.mockReturnValue(mockUseCase);

      await controller.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid amount' });
    });
  });

  describe('withdraw', () => {
    it('should withdraw amount from client account', async () => {
      const client = createMockClient({ id: 1, balance: 500 });
      const mockUseCase = { execute: jest.fn().mockResolvedValue(client) };
      mockContainer.getWithdrawUseCase.mockReturnValue(mockUseCase);

      req.params.id = '1';
      req.body = { amount: 500 };

      await controller.withdraw(req, res);

      expect(mockContainer.getWithdrawUseCase).toHaveBeenCalled();
      expect(mockUseCase.execute).toHaveBeenCalledWith({ clientId: 1, amount: 500 });
      expect(res.json).toHaveBeenCalledWith(client);
    });

    it('should handle insufficient balance error', async () => {
      const error = new Error('Insufficient balance');
      const mockUseCase = { execute: jest.fn().mockRejectedValue(error) };
      mockContainer.getWithdrawUseCase.mockReturnValue(mockUseCase);

      req.params.id = '1';
      req.body = { amount: 1500 };

      await controller.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient balance' });
    });

    it('should handle client not found error', async () => {
      const error = new NotFoundError('Client', 999);
      const mockUseCase = { execute: jest.fn().mockRejectedValue(error) };
      mockContainer.getWithdrawUseCase.mockReturnValue(mockUseCase);

      req.params.id = '999';
      req.body = { amount: 100 };

      await controller.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
