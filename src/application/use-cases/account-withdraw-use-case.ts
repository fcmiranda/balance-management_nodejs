import type {
  AccountWithdrawRequest,
  IAccountWithdrawUseCase,
} from '@application/interfaces/account-use-cases';
import type { AccountResponse } from '@domain/entities/account';
import { NotFoundError, UnauthorizedError } from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';

export class AccountWithdrawUseCase implements IAccountWithdrawUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(request: AccountWithdrawRequest): Promise<AccountResponse> {
    const account = await this.accountRepository.findById(request.accountId);
    if (!account) {
      throw new NotFoundError('Account', request.accountId);
    }

    if (account.userId !== request.userId) {
      throw new UnauthorizedError('You can only withdraw from your own account');
    }

    account.withdraw(request.amount);
    const updatedAccount = await this.accountRepository.update(account);

    return {
      id: updatedAccount.id || 0,
      userId: updatedAccount.userId,
      accountNumber: updatedAccount.accountNumber,
      balance: updatedAccount.balance,
      createdAt: updatedAccount.createdAt,
    };
  }
}
