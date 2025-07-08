import express from 'express';
import request from 'supertest';
import {
  DuplicateError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '../../src/domain/errors/domain-errors';
import { DIFactory } from '../../src/infrastructure/di/di-factory';
import { testUserData } from '../test-utils';

jest.mock('../../src/infrastructure/di/di-factory');
jest.mock('../../src/infrastructure/middleware/auth-middleware');

describe('User Routes Integration', () => {
  let app: express.Application;
  let mockDIFactory: any;
  let mockGetUserByIdUseCase: any;
  let mockCreateUserUseCase: any;
  let mockUpdateUserUseCase: any;
  let mockDeleteUserUseCase: any;
  let mockListUsersUseCase: any;

  beforeAll(() => {
    // Mock use cases
    mockGetUserByIdUseCase = {
      execute: jest.fn(),
    };

    mockCreateUserUseCase = {
      execute: jest.fn(),
    };

    mockUpdateUserUseCase = {
      execute: jest.fn(),
    };

    mockDeleteUserUseCase = {
      execute: jest.fn(),
    };

    mockListUsersUseCase = {
      execute: jest.fn(),
    };

    // Mock UserController
    const mockUserController = {
      getUserById: jest.fn((req, res) => {
        if (req.params.id === 'invalid') {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'User ID must be a valid number',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
          });
        }

        mockGetUserByIdUseCase
          .execute({ id: Number.parseInt(req.params.id) })
          .then((user) => {
            if (!user) {
              return res.status(404).json({
                error: 'Resource not found',
                message: `User with id ${req.params.id} not found`,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            res.status(200).json(user);
          })
          .catch((error) => {
            if (error instanceof NotFoundError) {
              return res.status(404).json({
                error: 'Resource not found',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            res.status(500).json({
              error: 'Internal server error',
              message: error.message,
              path: req.originalUrl,
              timestamp: new Date().toISOString(),
            });
          });
      }),
      createUser: jest.fn((req, res) => {
        mockCreateUserUseCase
          .execute(req.body)
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            if (error instanceof ValidationError) {
              return res.status(400).json({
                error: 'Validation failed',
                message: error.message,
                details: { validationErrors: error.details },
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            if (error instanceof DuplicateError) {
              return res.status(409).json({
                error: 'Duplicate resource',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            res.status(500).json({
              error: 'Internal server error',
              message: error.message,
              path: req.originalUrl,
              timestamp: new Date().toISOString(),
            });
          });
      }),
      updateUser: jest.fn((req, res) => {
        if (req.params.id === 'invalid') {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'User ID must be a valid number',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
          });
        }

        const userId = Number.parseInt(req.params.id);
        mockUpdateUserUseCase
          .execute({ id: userId, ...req.body })
          .then((user) => {
            res.status(200).json(user);
          })
          .catch((error) => {
            if (error instanceof NotFoundError) {
              return res.status(404).json({
                error: 'Resource not found',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            if (error instanceof ValidationError) {
              return res.status(400).json({
                error: 'Validation failed',
                message: error.message,
                details: { validationErrors: error.details },
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            if (error instanceof DuplicateError) {
              return res.status(409).json({
                error: 'Duplicate resource',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            res.status(500).json({
              error: 'Internal server error',
              message: error.message,
              path: req.originalUrl,
              timestamp: new Date().toISOString(),
            });
          });
      }),
      deleteUser: jest.fn((req, res) => {
        if (req.params.id === 'invalid') {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'User ID must be a valid number',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
          });
        }

        const userId = Number.parseInt(req.params.id);
        mockDeleteUserUseCase
          .execute({ id: userId })
          .then(() => {
            res.status(204).send();
          })
          .catch((error) => {
            if (error instanceof NotFoundError) {
              return res.status(404).json({
                error: 'Resource not found',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            if (error instanceof InvalidOperationError) {
              return res.status(400).json({
                error: 'Invalid operation',
                message: error.message,
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
              });
            }
            res.status(500).json({
              error: 'Internal server error',
              message: error.message,
              path: req.originalUrl,
              timestamp: new Date().toISOString(),
            });
          });
      }),
      listUsers: jest.fn((req, res) => {
        mockListUsersUseCase
          .execute()
          .then((users) => {
            res.status(200).json(users);
          })
          .catch((error) => {
            res.status(500).json({
              error: 'Internal server error',
              message: error.message,
              path: req.originalUrl,
              timestamp: new Date().toISOString(),
            });
          });
      }),
    };

    // Mock DIFactory
    mockDIFactory = {
      getInstance: jest.fn().mockReturnThis(),
      createUserController: jest.fn().mockReturnValue(mockUserController),
    };

    (DIFactory.getInstance as jest.Mock).mockReturnValue(mockDIFactory);

    // Mock authentication middleware
    const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
    (authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = { userId: 1, email: 'admin@example.com', role: 'admin' };
      next();
    });

    // Mock validation middleware
    jest.mock('../../src/infrastructure/validation/middleware', () => ({
      validateRequest: jest.fn(() => (_req, _res, next) => next()),
    }));

    // Import routes after mocking
    const userRoutes = require('../../src/routes/user-routes').default;

    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID successfully', async () => {
      const userResponse = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockGetUserByIdUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).get('/api/users/1').expect(200);

      expect(response.body).toEqual(userResponse);
      expect(mockGetUserByIdUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 404 when user not found', async () => {
      mockGetUserByIdUseCase.execute.mockResolvedValue(null);

      const response = await request(app).get('/api/users/999').expect(404);

      expect(response.body).toMatchObject({
        error: 'Resource not found',
        message: 'User with id 999 not found',
        path: '/api/users/999',
      });
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app).get('/api/users/invalid').expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'User ID must be a valid number',
        path: '/api/users/invalid',
      });
    });

    it('should return 404 when use case throws NotFoundError', async () => {
      const error = new NotFoundError('User', 999);
      mockGetUserByIdUseCase.execute.mockRejectedValue(error);

      const response = await request(app).get('/api/users/999').expect(404);

      expect(response.body).toMatchObject({
        error: 'Resource not found',
        message: error.message,
        path: '/api/users/999',
      });
    });
  });

  describe('GET /api/users', () => {
    it('should get all users successfully', async () => {
      const usersResponse = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'client',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockListUsersUseCase.execute.mockResolvedValue(usersResponse);

      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toEqual(usersResponse);
      expect(mockListUsersUseCase.execute).toHaveBeenCalledWith();
    });

    it('should return empty array when no users exist', async () => {
      mockListUsersUseCase.execute.mockResolvedValue([]);

      const response = await request(app).get('/api/users').expect(200);

      expect(response.body).toEqual([]);
      expect(mockListUsersUseCase.execute).toHaveBeenCalledWith();
    });

    it('should handle errors in listUsers', async () => {
      const error = new Error('Database connection failed');
      mockListUsersUseCase.execute.mockRejectedValue(error);

      const response = await request(app).get('/api/users').expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'Database connection failed',
        path: '/api/users',
      });
    });
  });

  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      const userData = testUserData.valid;
      const userResponse = {
        id: 1,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).post('/api/users').send(userData).expect(201);

      expect(response.body).toEqual(userResponse);
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData);
    });

    it('should return 400 for validation errors', async () => {
      const invalidUserData = {
        name: 'J', // Too short
        email: 'invalid-email',
        password: '123', // Too short
      };

      const validationError = new ValidationError('Validation failed', [
        'name',
        'email',
        'password',
      ]);
      mockCreateUserUseCase.execute.mockRejectedValue(validationError);

      const response = await request(app).post('/api/users').send(invalidUserData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'Validation failed',
        details: { validationErrors: ['name', 'email', 'password'] },
        path: '/api/users',
      });
    });

    it('should return 409 for duplicate email', async () => {
      const userData = testUserData.valid;
      const duplicateError = new DuplicateError('User', 'email', userData.email);
      mockCreateUserUseCase.execute.mockRejectedValue(duplicateError);

      const response = await request(app).post('/api/users').send(userData).expect(409);

      expect(response.body).toMatchObject({
        error: 'Duplicate resource',
        message: duplicateError.message,
        path: '/api/users',
      });
    });

    it('should handle unexpected errors', async () => {
      const userData = testUserData.valid;
      const error = new Error('Database connection failed');
      mockCreateUserUseCase.execute.mockRejectedValue(error);

      const response = await request(app).post('/api/users').send(userData).expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'Database connection failed',
        path: '/api/users',
      });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'John Updated', email: 'john.updated@example.com' };
      const userResponse = {
        id: 1,
        name: updateData.name,
        email: updateData.email,
        role: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUpdateUserUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).put('/api/users/1').send(updateData).expect(200);

      expect(response.body).toEqual(userResponse);
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
        id: 1,
        ...updateData,
      });
    });

    it('should return 400 for invalid user ID', async () => {
      const updateData = { name: 'John Updated' };

      const response = await request(app).put('/api/users/invalid').send(updateData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'User ID must be a valid number',
        path: '/api/users/invalid',
      });
    });

    it('should return 404 when user not found', async () => {
      const updateData = { name: 'John Updated' };
      const notFoundError = new NotFoundError('User', 999);
      mockUpdateUserUseCase.execute.mockRejectedValue(notFoundError);

      const response = await request(app).put('/api/users/999').send(updateData).expect(404);

      expect(response.body).toMatchObject({
        error: 'Resource not found',
        message: notFoundError.message,
        path: '/api/users/999',
      });
    });

    it('should return 400 for validation errors', async () => {
      const invalidUpdateData = { name: 'J' }; // Too short
      const validationError = new ValidationError('Name must be at least 2 characters long', [
        'name',
      ]);
      mockUpdateUserUseCase.execute.mockRejectedValue(validationError);

      const response = await request(app).put('/api/users/1').send(invalidUpdateData).expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'Name must be at least 2 characters long',
        details: { validationErrors: ['name'] },
        path: '/api/users/1',
      });
    });

    it('should return 409 for duplicate email', async () => {
      const updateData = { email: 'existing@example.com' };
      const duplicateError = new DuplicateError('User', 'email', updateData.email);
      mockUpdateUserUseCase.execute.mockRejectedValue(duplicateError);

      const response = await request(app).put('/api/users/1').send(updateData).expect(409);

      expect(response.body).toMatchObject({
        error: 'Duplicate resource',
        message: duplicateError.message,
        path: '/api/users/1',
      });
    });

    it('should handle unexpected errors', async () => {
      const updateData = { name: 'John Updated' };
      const error = new Error('Database connection failed');
      mockUpdateUserUseCase.execute.mockRejectedValue(error);

      const response = await request(app).put('/api/users/1').send(updateData).expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'Database connection failed',
        path: '/api/users/1',
      });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      const response = await request(app).delete('/api/users/1').expect(204);

      expect(response.body).toEqual({});
      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app).delete('/api/users/invalid').expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        message: 'User ID must be a valid number',
        path: '/api/users/invalid',
      });
    });

    it('should return 404 when user not found', async () => {
      const notFoundError = new NotFoundError('User', 999);
      mockDeleteUserUseCase.execute.mockRejectedValue(notFoundError);

      const response = await request(app).delete('/api/users/999').expect(404);

      expect(response.body).toMatchObject({
        error: 'Resource not found',
        message: notFoundError.message,
        path: '/api/users/999',
      });
    });

    it('should return 400 when user has active accounts', async () => {
      const invalidOperationError = new InvalidOperationError(
        'delete user',
        'User has accounts with positive balance',
      );
      mockDeleteUserUseCase.execute.mockRejectedValue(invalidOperationError);

      const response = await request(app).delete('/api/users/1').expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid operation',
        message: invalidOperationError.message,
        path: '/api/users/1',
      });
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Database connection failed');
      mockDeleteUserUseCase.execute.mockRejectedValue(error);

      const response = await request(app).delete('/api/users/1').expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal server error',
        message: 'Database connection failed',
        path: '/api/users/1',
      });
    });
  });

  describe('Authorization scenarios', () => {
    beforeEach(() => {
      // Reset authentication mock for authorization tests
      const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
      (authenticateToken as jest.Mock).mockClear();
    });

    it('should allow admin to create users', async () => {
      const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
      (authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
        req.user = { userId: 1, email: 'admin@example.com', role: 'admin' };
        next();
      });

      const userData = testUserData.valid;
      const userResponse = {
        id: 2,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).post('/api/users').send(userData).expect(201);

      expect(response.body).toEqual(userResponse);
    });

    it('should allow admin to delete any user', async () => {
      const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
      (authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
        req.user = { userId: 1, email: 'admin@example.com', role: 'admin' };
        next();
      });

      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      await request(app).delete('/api/users/2').expect(204);

      expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id: 2 });
    });

    it('should allow users to update their own profile', async () => {
      const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
      (authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
        req.user = { userId: 1, email: 'user@example.com', role: 'client' };
        next();
      });

      const updateData = { name: 'Updated Name' };
      const userResponse = {
        id: 1,
        name: updateData.name,
        email: 'user@example.com',
        role: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUpdateUserUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).put('/api/users/1').send(updateData).expect(200);

      expect(response.body).toEqual(userResponse);
    });

    it('should allow admin to update any user', async () => {
      const { authenticateToken } = require('../../src/infrastructure/middleware/auth-middleware');
      (authenticateToken as jest.Mock).mockImplementation((req, _res, next) => {
        req.user = { userId: 1, email: 'admin@example.com', role: 'admin' };
        next();
      });

      const updateData = { name: 'Updated Name' };
      const userResponse = {
        id: 2,
        name: updateData.name,
        email: 'other@example.com',
        role: 'client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUpdateUserUseCase.execute.mockResolvedValue(userResponse);

      const response = await request(app).put('/api/users/2').send(updateData).expect(200);

      expect(response.body).toEqual(userResponse);
    });
  });
});
