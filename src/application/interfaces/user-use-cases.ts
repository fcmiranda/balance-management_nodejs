import type { User } from '@domain/entities/auth';
import type { CommandUseCase } from './use-case';

export interface GetUserByIdRequest {
  id: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'client';
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'client';
}

export interface DeleteUserRequest {
  id: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetUserByIdUseCase
  extends CommandUseCase<GetUserByIdRequest, UserResponse | null> {}

export interface ICreateUserUseCase extends CommandUseCase<CreateUserRequest, UserResponse> {}

export interface IUpdateUserUseCase extends CommandUseCase<UpdateUserRequest, UserResponse> {}

export interface IDeleteUserUseCase extends CommandUseCase<DeleteUserRequest, void> {}

// Re-export types for convenience
export type { User };
