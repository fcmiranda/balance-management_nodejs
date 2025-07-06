import type {
  UpdateUserRequest,
  IUpdateUserUseCase,
  UserResponse,
} from '@application/interfaces/user-use-cases';
import { NotFoundError, ValidationError, DuplicateError } from '@domain/errors/domain-errors';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { AuthService } from '@infrastructure/auth/auth-service';

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.authRepository.findUserById(request.id);
    if (!existingUser) {
      throw new NotFoundError('User', request.id);
    }

    // Validate input
    const updates: Partial<Pick<typeof existingUser, 'name' | 'email' | 'password' | 'role'>> = {};

    if (request.name !== undefined) {
      if (request.name.trim().length < 2) {
        throw new ValidationError('Name must be at least 2 characters long', ['name']);
      }
      updates.name = request.name.trim();
    }

    if (request.email !== undefined) {
      if (!this.isValidEmail(request.email)) {
        throw new ValidationError('Valid email is required', ['email']);
      }

      // Check if email is already taken by another user
      const emailUser = await this.authRepository.findUserByEmail(request.email.toLowerCase());
      if (emailUser && emailUser.id !== request.id) {
        throw new DuplicateError('User', 'email', request.email);
      }

      updates.email = request.email.toLowerCase();
    }

    if (request.password !== undefined) {
      if (request.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long', ['password']);
      }
      updates.password = await this.authService.hashPassword(request.password);
    }

    if (request.role !== undefined) {
      if (!['admin', 'client'].includes(request.role)) {
        throw new ValidationError('Role must be either "admin" or "client"', ['role']);
      }
      updates.role = request.role;
    }

    // Update user
    const updatedUser = await this.authRepository.updateUser(request.id, updates);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
