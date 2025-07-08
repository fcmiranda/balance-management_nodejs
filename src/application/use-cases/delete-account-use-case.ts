import type {
  DeleteAccountRequest,
  IDeleteAccountUseCase,
} from '@application/interfaces/account-use-cases';
import {
  InvalidOperationError,
  NotFoundError,
  UnauthorizedError,
} from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';

export class DeleteAccountUseCase implements IDeleteAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(request: DeleteAccountRequest): Promise<void> {
    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new NotFoundError('Account', request.accountId);
    }

    if (account.userId !== request.userId) {
      throw new UnauthorizedError('You can only delete your own account');
    }

    if (account.balance > 0) {
      throw new InvalidOperationError(
        'delete account',
        'Account has a positive balance. Please withdraw all funds before deleting the account.',
      );
    }

    await this.accountRepository.delete(request.accountId);
  }
}
