import type { JwtPayload } from '@domain/entities/auth';
import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth/auth-service';
import { handleAuthError, handleAuthorizationError } from './standard-error-handler';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to authenticate JWT tokens
   */
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = this.authService.extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        handleAuthError('No token provided', req, res);
        return;
      }

      const decoded = this.authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (_error) {
      handleAuthorizationError('Invalid or expired token', req, res);
    }
  };

  /**
   * Middleware to authorize specific roles
   */
  authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        handleAuthError('Authentication required', req, res);
        return;
      }

      if (!roles.includes(req.user.role)) {
        handleAuthorizationError('Insufficient permissions', req, res);
        return;
      }

      next();
    };
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const token = this.authService.extractTokenFromHeader(req.headers.authorization);

      if (token) {
        const decoded = this.authService.verifyToken(token);
        req.user = decoded;
      }

      next();
    } catch (_error) {
      next();
    }
  };
}

const authMiddleware = new AuthMiddleware();
export const authenticateToken = authMiddleware.authenticate;
