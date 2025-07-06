import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../../domain/entities/auth';

export interface IAuthUseCase {
  login(loginData: LoginRequest): Promise<AuthResponse>;
  register(registerData: RegisterRequest): Promise<AuthResponse>;
  getCurrentUser(userId: number): Promise<User>;
}

export interface IAuthContainer {
  getAuthUseCase(): IAuthUseCase;
}
