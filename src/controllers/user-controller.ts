import type {
  ICreateUserUseCase,
  IDeleteUserUseCase,
  IGetUserByIdUseCase,
  IListUsersUseCase,
  IUpdateUserUseCase,
} from '@application/interfaces/user-use-cases';
import {
  handleError,
  handleValidationError,
  sendData,
} from '@infrastructure/middleware/standard-error-handler';
import type { Request, Response } from 'express';

export class UserController {
  constructor(
    private readonly getUserByIdUseCase: IGetUserByIdUseCase,
    private readonly createUserUseCase: ICreateUserUseCase,
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly deleteUserUseCase: IDeleteUserUseCase,
    private readonly listUsersUseCase: IListUsersUseCase,
  ) {}

  /**
   * GET /users - Get all users
   */
  async listUsers(req: Request, res: Response): Promise<Response> {
    try {
      const useCase = this.listUsersUseCase;
      const users = await useCase.execute();

      sendData(users, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  /**
   * GET /users/{id} - Get user details by ID
   */
  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        handleValidationError('Invalid user ID', 'User ID must be a valid number', req, res);
        return res;
      }

      const useCase = this.getUserByIdUseCase;
      const user = await useCase.execute({ id: userId });

      if (!user) {
        handleValidationError('User not found', 'No user found with the provided ID', req, res);
        return res;
      }

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      sendData(userResponse, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  /**
   * POST /users - Create a new user with account
   */
  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role } = req.body;

      const useCase = this.createUserUseCase;
      const user = await useCase.execute({
        name,
        email,
        password,
        role: role || 'client',
      });

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      sendData(userResponse, res, 201);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  /**
   * PUT /users/{id} - Edit user details
   */
  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        handleValidationError('Invalid user ID', 'User ID must be a valid number', req, res);
        return res;
      }

      const { name, email, password, role } = req.body;

      const useCase = this.updateUserUseCase;
      const user = await useCase.execute({
        id: userId,
        name,
        email,
        password,
        role,
      });

      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      sendData(userResponse, res);
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }

  /**
   * DELETE /users/{id} - Delete user details
   */
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number.parseInt(req.params.id);

      if (Number.isNaN(userId)) {
        handleValidationError('Invalid user ID', 'User ID must be a valid number', req, res);
        return res;
      }

      await this.deleteUserUseCase.execute({ id: userId });

      res.status(204).send();
      return res;
    } catch (error) {
      handleError(error, req, res);
      return res;
    }
  }
}
