import type { IAuthUseCase } from '@application/interfaces/auth-use-cases';
import {
  handleAuthError,
  handleError,
  sendData,
} from '@infrastructure/middleware/standard-error-handler';
import type { Request, Response } from 'express';

export class AuthController {
  constructor(private readonly authUseCase: IAuthUseCase) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authUseCase.login(req.body);

      sendData(result, res, 200);
    } catch (error) {
      handleError(error, req, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authUseCase.register(req.body);

      sendData(result, res, 201);
    } catch (error) {
      handleError(error, req, res);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        handleAuthError('Authentication required', req, res);
        return;
      }

      const user = await this.authUseCase.getCurrentUser(req.user.userId);

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      sendData(userResponse, res, 200);
    } catch (error) {
      handleError(error, req, res);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    sendData({ message: 'Logged out successfully' }, res, 200);
  }
}
