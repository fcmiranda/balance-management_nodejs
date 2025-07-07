import type { IListUsersUseCase, UserResponse } from '@application/interfaces/user-use-cases';
import type { AuthRepository } from '@domain/repositories/auth-repository';

export class ListUsersUseCase implements IListUsersUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<UserResponse[]> {
    const users = await this.authRepository.findAllUsers();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
