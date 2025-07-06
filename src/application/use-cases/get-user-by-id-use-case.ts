import type {
  GetUserByIdRequest,
  IGetUserByIdUseCase,
  UserResponse,
} from '@application/interfaces/user-use-cases';
import { NotFoundError } from '@domain/errors/domain-errors';
import type { AuthRepository } from '@domain/repositories/auth-repository';

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(request: GetUserByIdRequest): Promise<UserResponse | null> {
    const user = await this.authRepository.findUserById(request.id);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
