import type {
  CreateUserRequest,
  ICreateUserUseCase,
  UserResponse,
} from '@application/interfaces/user-use-cases';
import { DuplicateError, ValidationError } from '@domain/errors/domain-errors';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { AuthService } from '@infrastructure/auth/auth-service';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(request: CreateUserRequest): Promise<UserResponse> {
    // Validate input
    if (!request.name || request.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long', ['name']);
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new ValidationError('Valid email is required', ['email']);
    }

    if (!request.password || request.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long', ['password']);
    }

    // Check if user already exists
    const existingUser = await this.authRepository.findUserByEmail(request.email.toLowerCase());
    if (existingUser) {
      throw new DuplicateError('User', 'email', request.email);
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(request.password);

    // Create user with default role if not provided
    const user = await this.authRepository.createUser(
      request.name.trim(),
      request.email.toLowerCase(),
      hashedPassword,
      request.role || 'client',
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
