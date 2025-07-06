import type { Request, Response } from 'express';
import { AuthUseCase } from '../application/use-cases/auth-use-case';
import { loginSchema, registerSchema } from '../domain/entities/auth';
import { AuthService } from '../infrastructure/auth/auth-service';
import { SQLiteAuthRepository } from '../infrastructure/repositories/sqlite-auth-repository';

export class AuthController {
  private authUseCase: AuthUseCase;

  constructor() {
    const authRepository = new SQLiteAuthRepository();
    const authService = new AuthService();
    this.authUseCase = new AuthUseCase(authRepository, authService);
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData = loginSchema.parse(req.body);
      const result = await this.authUseCase.login(loginData);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData = registerSchema.parse(req.body);
      const result = await this.authUseCase.register(registerData);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const user = await this.authUseCase.getCurrentUser(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({
        error: 'User not found',
        message: error instanceof Error ? error.message : 'User not found',
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // For JWT, logout is handled client-side by removing the token
    // In a more complex implementation, you might maintain a blacklist
    res.status(200).json({
      message: 'Logged out successfully',
    });
  }
}
