import type { AuthResponse, User } from '@domain/entities/auth';
import { DuplicateError, NotFoundError, ValidationError } from '@domain/errors/domain-errors';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import type { AuthService } from '@infrastructure/auth/auth-service';
import type { LoginRequest, RegisterRequest } from '@infrastructure/validation/schemas';

export class AuthUseCase {
  constructor(
    private authRepository: AuthRepository,
    private authService: AuthService,
  ) {}

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(loginData.email);

    if (!user) {
      throw new ValidationError('Invalid email or password', ['Invalid credentials']);
    }

    const isPasswordValid = await this.authService.comparePassword(
      loginData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password', ['Invalid credentials']);
    }

    const token = this.authService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findUserByEmail(registerData.email);

    if (existingUser) {
      throw new DuplicateError('User', 'email', registerData.email);
    }

    const hashedPassword = await this.authService.hashPassword(registerData.password);

    const user = await this.authRepository.createUser(
      registerData.name,
      registerData.email,
      hashedPassword,
      registerData.role,
    );

    const token = this.authService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }
}
