import type { AuthResponse, User } from '@domain/entities/auth';
import type { LoginRequest, RegisterRequest } from '@infrastructure/validation/schemas';

export interface IAuthUseCase {
  login(loginData: LoginRequest): Promise<AuthResponse>;
  register(registerData: RegisterRequest): Promise<AuthResponse>;
  getCurrentUser(userId: number): Promise<User>;
}

export interface IAuthContainer {
  getAuthUseCase(): IAuthUseCase;
}
