import type {
  GetAccountsByUserIdRequest,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import type { AccountResponse } from '@domain/entities/account';
import type { AccountRepository } from '@domain/repositories/account-repository';

export class GetAccountsByUserIdUseCase implements IGetAccountsByUserIdUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(request: GetAccountsByUserIdRequest): Promise<AccountResponse[]> {
    const accounts = await this.accountRepository.findByUserId(request.userId);

    return accounts.map((account) => ({
      id: account.id || 0,
      userId: account.userId,
      accountNumber: account.accountNumber,
      balance: account.balance,
      accountType: account.accountType,
      status: account.status,
    }));
  }
}
