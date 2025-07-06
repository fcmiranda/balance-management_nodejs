import { AuthController } from '../../src/controllers/auth-controller';
import { Container } from '../../src/infrastructure/container';
import { createMockRequest, createMockResponse, createMockUser, testUserData } from '../test-utils';
import { ValidationError, DuplicateError, NotFoundError } from '../../src/domain/errors/domain-errors';

// Mock the Container
jest.mock('../../src/infrastructure/container');

describe('AuthController', () => {
  let controller: AuthController;
  let mockContainer: jest.Mocked<Container>;
  let mockAuthUseCase: any;
  let req: any;
  let res: any;

  beforeEach(() => {
    mockAuthUseCase = {
      login: jest.fn(),
      register: jest.fn(),
      getCurrentUser: jest.fn(),
    };

    mockContainer = {
      getInstance: jest.fn(),
      getAuthUseCase: jest.fn().mockReturnValue(mockAuthUseCase),
    } as any;

    (Container.getInstance as jest.Mock).mockReturnValue(mockContainer);

    controller = new AuthController();
    req = createMockRequest();
    res = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const authResponse = {
        token: 'jwt-token',
        user: { id: 1, email: 'test@example.com', role: 'client' },
      };

      req.body = loginData;
      mockAuthUseCase.login.mockResolvedValue(authResponse);

      await controller.login(req, res);

      expect(mockAuthUseCase.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authResponse);
    });

    it('should handle invalid credentials', async () => {
      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      const error = new ValidationError('Invalid email or password', ['Invalid credentials']);

      req.body = loginData;
      mockAuthUseCase.login.mockRejectedValue(error);

      await controller.login(req, res);

      expect(mockAuthUseCase.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Login failed',
        message: error.message,
      });
    });

    it('should handle malformed request data', async () => {
      req.body = { email: 'invalid-email', password: '123' };

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Login failed',
        message: expect.stringContaining('Invalid email format'),
      });
    });
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      const registerData = testUserData.valid;
      const authResponse = {
        token: 'jwt-token',
        user: { id: 1, email: registerData.email, role: registerData.role },
      };

      req.body = registerData;
      mockAuthUseCase.register.mockResolvedValue(authResponse);

      await controller.register(req, res);

      expect(mockAuthUseCase.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(authResponse);
    });

    it('should handle duplicate email error', async () => {
      const registerData = testUserData.valid;
      const error = new DuplicateError('User', 'email', registerData.email);

      req.body = registerData;
      mockAuthUseCase.register.mockRejectedValue(error);

      await controller.register(req, res);

      expect(mockAuthUseCase.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Registration failed',
        message: error.message,
      });
    });

    it('should handle validation error', async () => {
      req.body = { email: 'invalid-email', password: '123', role: 'invalid' };

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Registration failed',
        message: expect.stringContaining('Invalid email format'),
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = createMockUser({ id: 1, email: 'test@example.com' });
      
      req.user = { userId: 1, email: 'test@example.com', role: 'client' };
      mockAuthUseCase.getCurrentUser.mockResolvedValue(user);

      await controller.getCurrentUser(req, res);

      expect(mockAuthUseCase.getCurrentUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 401 if no user in request', async () => {
      req.user = undefined;

      await controller.getCurrentUser(req, res);

      expect(mockAuthUseCase.getCurrentUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should handle user not found error', async () => {
      const error = new NotFoundError('User', 999);
      
      req.user = { userId: 999, email: 'test@example.com', role: 'client' };
      mockAuthUseCase.getCurrentUser.mockRejectedValue(error);

      await controller.getCurrentUser(req, res);

      expect(mockAuthUseCase.getCurrentUser).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
        message: error.message,
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await controller.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
