import type { User } from '../entities/auth';

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(name: string, email: string, hashedPassword: string, role: string): Promise<User>;
  findUserById(id: number): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
  // User management methods
  updateUser(
    id: number,
    updates: Partial<Pick<User, 'name' | 'email' | 'password' | 'role'>>,
  ): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
