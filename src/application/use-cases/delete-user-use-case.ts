import type { DeleteUserRequest, IDeleteUserUseCase } from '@application/interfaces/user-use-cases';
import { InvalidOperationError, NotFoundError } from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(request: DeleteUserRequest): Promise<void> {
    // Check if user exists
    const existingUser = await this.authRepository.findUserById(request.id);
    if (!existingUser) {
      throw new NotFoundError('User', request.id);
    }

    // Check if user has active accounts
    const userAccounts = await this.accountRepository.findByUserId(request.id);
    const activeAccounts = userAccounts.filter((account) => account.status === 'active');

    if (activeAccounts.length > 0) {
      throw new InvalidOperationError(
        'delete user',
        'User has active accounts. Please close or transfer all accounts before deleting the user.',
      );
    }

    // Check if user has accounts with positive balance
    const accountsWithBalance = userAccounts.filter((account) => account.balance > 0);
    if (accountsWithBalance.length > 0) {
      throw new InvalidOperationError(
        'delete user',
        'User has accounts with positive balance. Please withdraw all funds before deleting the user.',
      );
    }

    // Delete user (accounts will be cascade deleted due to database constraint)
    await this.authRepository.deleteUser(request.id);
  }
}
