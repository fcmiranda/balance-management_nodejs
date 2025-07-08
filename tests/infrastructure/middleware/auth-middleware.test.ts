import { AuthService } from '../../../src/infrastructure/auth/auth-service';
import { AuthMiddleware } from '../../../src/infrastructure/middleware/auth-middleware';
import { createMockNext, createMockRequest, createMockResponse } from '../../test-utils';

jest.mock('../../../src/infrastructure/auth/auth-service');

describe('Auth Middleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockAuthService: jest.Mocked<AuthService>;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    mockAuthService = {
      extractTokenFromHeader: jest.fn(),
      verifyToken: jest.fn(),
      generateToken: jest.fn(),
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    } as any;

    (AuthService as jest.MockedClass<typeof AuthService>).mockImplementation(() => mockAuthService);

    authMiddleware = new AuthMiddleware();
    req = createMockRequest();
    res = createMockResponse();
    next = createMockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid token', () => {
      const token = 'valid-token';
      const payload = { userId: 1, email: 'test@example.com', role: 'client' };

      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.extractTokenFromHeader.mockReturnValue(token);
      mockAuthService.verifyToken.mockReturnValue(payload);

      authMiddleware.authenticate(req, res, next);

      expect(mockAuthService.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', () => {
      mockAuthService.extractTokenFromHeader.mockReturnValue(null);

      authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No token provided',
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', () => {
      req.headers.authorization = 'InvalidFormat';
      mockAuthService.extractTokenFromHeader.mockReturnValue(null);

      authMiddleware.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No token provided',
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      const token = 'invalid-token';

      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.extractTokenFromHeader.mockReturnValue(token);
      mockAuthService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.authenticate(req, res, next);

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'Invalid or expired token',
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle token with Bearer prefix', () => {
      const token = 'valid-token';
      const payload = { userId: 1, email: 'test@example.com', role: 'client' };

      req.headers.authorization = `Bearer ${token}`;
      mockAuthService.extractTokenFromHeader.mockReturnValue(token);
      mockAuthService.verifyToken.mockReturnValue(payload);

      authMiddleware.authenticate(req, res, next);

      expect(mockAuthService.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with correct role', () => {
      const roles = ['admin', 'client'];
      req.user = { userId: 1, email: 'test@example.com', role: 'admin' };

      const middleware = authMiddleware.authorize(roles);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const roles = ['admin'];

      const middleware = authMiddleware.authorize(roles);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'Authentication required',
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user has insufficient permissions', () => {
      const roles = ['admin'];
      req.user = { userId: 1, email: 'test@example.com', role: 'client' };

      const middleware = authMiddleware.authorize(roles);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'Insufficient permissions',
        timestamp: expect.any(String),
        path: '/test',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
