import {
  DuplicateError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from '@domain/errors/domain-errors';
import type { Container } from '@infrastructure/container';
import type { Request, Response } from 'express';

export class UserController {
  constructor(private readonly container: Container) {}

  /**
   * GET /users/{id} - Get user details by ID
   */
  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const useCase = this.container.getUserByIdUseCase();
      const user = await useCase.execute({ id: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /users - Create a new user with account
   */
  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role } = req.body;

      const useCase = this.container.getCreateUserUseCase();
      const user = await useCase.execute({
        name,
        email,
        password,
        role: role || 'client',
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: error.message,
          details: error.validationErrors,
        });
      }

      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }

      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /users/{id} - Edit user details
   */
  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { name, email, password, role } = req.body;

      const useCase = this.container.getUpdateUserUseCase();
      const user = await useCase.execute({
        id: userId,
        name,
        email,
        password,
        role,
      });

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: error.message,
          details: error.validationErrors,
        });
      }

      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }

      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }

      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /users/{id} - Delete user details
   */
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const useCase = this.container.getDeleteUserUseCase();
      await useCase.execute({ id: userId });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }

      if (error instanceof InvalidOperationError) {
        return res.status(400).json({ error: error.message });
      }

      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
