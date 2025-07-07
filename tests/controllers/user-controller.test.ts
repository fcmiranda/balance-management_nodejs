import { UserController } from '@controllers/user-controller';
import {
  DuplicateError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '@domain/errors/domain-errors';
import { Container } from '@infrastructure/container';
import { authenticateToken } from '@infrastructure/middleware/auth-middleware';
import express from 'express';
import request from 'supertest';

// Mock the container
jest.mock('@infrastructure/container');

const mockContainer = {
  getUserByIdUseCase: jest.fn(),
  getCreateUserUseCase: jest.fn(),
  getUpdateUserUseCase: jest.fn(),
  getDeleteUserUseCase: jest.fn(),
};

const mockUserResponse = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'client',
  createdAt: '2025-07-06T22:06:00.946Z',
  updatedAt: '2025-07-06T22:06:00.946Z',
};

describe('UserController', () => {
  let app: express.Application;
  let userController: UserController;

  beforeEach(() => {
    jest.clearAllMocks();
    (Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

    userController = new UserController(mockContainer as any);
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req, _res, next) => {
      req.user = { userId: 1, email: 'test@example.com', role: 'admin' };
      next();
    });
  });

  describe('GET /users/:id', () => {
    it('should return user when found', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockUserResponse),
      };
      mockContainer.getUserByIdUseCase.mockReturnValue(mockUseCase);

      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserResponse);
      expect(mockUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 404 when user not found', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(null),
      };
      mockContainer.getUserByIdUseCase.mockReturnValue(mockUseCase);

      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid user ID');
    });
  });

  describe('POST /users', () => {
    it('should create user successfully', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(mockUserResponse),
      };
      mockContainer.getCreateUserUseCase.mockReturnValue(mockUseCase);

      app.post('/users', (req, res) => {
        userController.createUser(req, res);
      });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'client',
      };

      const response = await request(app).post('/users').send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockUserResponse);
      expect(mockUseCase.execute).toHaveBeenCalledWith(userData);
    });

    it('should return 400 for validation errors', async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new ValidationError('Validation failed', ['name'])),
      };
      mockContainer.getCreateUserUseCase.mockReturnValue(mockUseCase);

      app.post('/users', (req, res) => {
        userController.createUser(req, res);
      });

      const response = await request(app)
        .post('/users')
        .send({ name: 'J', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(['name']);
    });

    it('should return 409 for duplicate email', async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new DuplicateError('User', 'email', 'john@example.com')),
      };
      mockContainer.getCreateUserUseCase.mockReturnValue(mockUseCase);

      app.post('/users', (req, res) => {
        userController.createUser(req, res);
      });

      const response = await request(app)
        .post('/users')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("User with email 'john@example.com' already exists");
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updatedUser = { ...mockUserResponse, name: 'John Updated' };
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(updatedUser),
      };
      mockContainer.getUpdateUserUseCase.mockReturnValue(mockUseCase);

      app.put('/users/:id', (req, res) => {
        userController.updateUser(req, res);
      });

      const response = await request(app).put('/users/1').send({ name: 'John Updated' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Updated');
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        name: 'John Updated',
      });
    });

    it('should return 404 when user not found', async () => {
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new NotFoundError('User', 999)),
      };
      mockContainer.getUpdateUserUseCase.mockReturnValue(mockUseCase);

      app.put('/users/:id', (req, res) => {
        userController.updateUser(req, res);
      });

      const response = await request(app).put('/users/999').send({ name: 'John Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User with id 999 not found');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue(undefined),
      };
      mockContainer.getDeleteUserUseCase.mockReturnValue(mockUseCase);

      app.delete('/users/:id', (req, res) => {
        userController.deleteUser(req, res);
      });

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(204);
      expect(mockUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 400 when user has active accounts', async () => {
      const mockUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(new InvalidOperationError('delete user', 'User has active accounts')),
      };
      mockContainer.getDeleteUserUseCase.mockReturnValue(mockUseCase);

      app.delete('/users/:id', (req, res) => {
        userController.deleteUser(req, res);
      });

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid operation 'delete user': User has active accounts");
    });
  });
});
