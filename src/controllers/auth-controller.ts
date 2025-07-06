import type { Request, Response } from 'express';
import type { IAuthUseCase } from '../application/interfaces/auth-use-cases';
import { Container } from '../infrastructure/container';

export class AuthController {
  private readonly authUseCase: IAuthUseCase;

  constructor() {
    const container = Container.getInstance();
    this.authUseCase = container.getAuthUseCase();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Request body is already validated by middleware
      const result = await this.authUseCase.login(req.body);

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
      // Request body is already validated by middleware
      const result = await this.authUseCase.register(req.body);

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
