import { UserController } from '@controllers/user-controller';
import {
  DuplicateError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '@domain/errors/domain-errors';
import { authenticateToken } from '@infrastructure/middleware/auth-middleware';
import express from 'express';
import request from 'supertest';

const mockGetUserByIdUseCase = {
  execute: jest.fn(),
};

const mockCreateUserUseCase = {
  execute: jest.fn(),
};

const mockUpdateUserUseCase = {
  execute: jest.fn(),
};

const mockDeleteUserUseCase = {
  execute: jest.fn(),
};

const mockListUsersUseCase = {
  execute: jest.fn(),
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

    userController = new UserController(
      mockGetUserByIdUseCase,
      mockCreateUserUseCase,
      mockUpdateUserUseCase,
      mockDeleteUserUseCase,
      mockListUsersUseCase,
    );
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
      mockGetUserByIdUseCase.execute.mockResolvedValue(mockUserResponse);

      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserResponse);
      expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 404 when user not found', async () => {
      mockGetUserByIdUseCase.execute.mockResolvedValue(null);

      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid user ID', async () => {
      app.get('/users/:id', (req, res) => {
        userController.getUserById(req, res);
      });

      const response = await request(app).get('/users/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /users', () => {
    it('should return all users successfully', async () => {
      const usersResponse = [
        mockUserResponse,
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          createdAt: '2025-07-06T22:06:00.946Z',
          updatedAt: '2025-07-06T22:06:00.946Z',
        },
      ];

      mockListUsersUseCase.execute.mockResolvedValue(usersResponse);

      app.get('/users', (req, res) => {
        userController.listUsers(req, res);
      });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(usersResponse);
      expect(mockListUsersUseCase.execute).toHaveBeenCalledWith();
    });

    it('should return empty array when no users exist', async () => {
      mockListUsersUseCase.execute.mockResolvedValue([]);

      app.get('/users', (req, res) => {
        userController.listUsers(req, res);
      });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(mockListUsersUseCase.execute).toHaveBeenCalledWith();
    });
  });

  describe('POST /users', () => {
    it('should create user successfully', async () => {
      mockCreateUserUseCase.execute.mockResolvedValue(mockUserResponse);

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
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData);
    });

    it('should return 400 for validation errors', async () => {
      mockCreateUserUseCase.execute.mockRejectedValue(
        new ValidationError('Validation failed', ['name']),
      );

      app.post('/users', (req, res) => {
        userController.createUser(req, res);
      });

      const response = await request(app)
        .post('/users')
        .send({ name: 'J', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual({ validationErrors: ['name'] });
    });

    it('should return 409 for duplicate email', async () => {
      mockCreateUserUseCase.execute.mockRejectedValue(
        new DuplicateError('User', 'email', 'john@example.com'),
      );

      app.post('/users', (req, res) => {
        userController.createUser(req, res);
      });

      const response = await request(app)
        .post('/users')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Duplicate resource');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updatedUser = { ...mockUserResponse, name: 'John Updated' };
      mockUpdateUserUseCase.execute.mockResolvedValue(updatedUser);

      app.put('/users/:id', (req, res) => {
        userController.updateUser(req, res);
      });

      const response = await request(app).put('/users/1').send({ name: 'John Updated' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Updated');
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        name: 'John Updated',
      });
    });

    it('should return 404 when user not found', async () => {
      mockUpdateUserUseCase.execute.mockRejectedValue(new NotFoundError('User', 999));

      app.put('/users/:id', (req, res) => {
        userController.updateUser(req, res);
      });

      const response = await request(app).put('/users/999').send({ name: 'John Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource not found');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      app.delete('/users/:id', (req, res) => {
        userController.deleteUser(req, res);
      });

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(204);
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 400 when user has active accounts', async () => {
      mockDeleteUserUseCase.execute.mockRejectedValue(
        new InvalidOperationError('delete user', 'User has active accounts'),
      );

      app.delete('/users/:id', (req, res) => {
        userController.deleteUser(req, res);
      });

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid operation');
    });
  });
});
