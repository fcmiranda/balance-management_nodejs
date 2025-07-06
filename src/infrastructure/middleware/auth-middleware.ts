import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from '../../domain/entities/auth';
import { AuthService } from '../auth/auth-service';

// Extend Express Request to include user
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
        res.status(401).json({
          error: 'Access denied',
          message: 'No token provided',
        });
        return;
      }

      const decoded = this.authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (_error) {
      res.status(403).json({
        error: 'Access denied',
        message: 'Invalid or expired token',
      });
    }
  };

  /**
   * Middleware to authorize specific roles
   */
  authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Access denied',
          message: 'Authentication required',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Access denied',
          message: 'Insufficient permissions',
        });
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
      // Continue without authentication
      next();
    }
  };
}

// Export instance for backward compatibility
const authMiddleware = new AuthMiddleware();
export const authenticateToken = authMiddleware.authenticate;
