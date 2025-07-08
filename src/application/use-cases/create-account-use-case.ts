import type {
  CreateAccountRequest,
  ICreateAccountUseCase,
} from '@application/interfaces/account-use-cases';
import type { AccountResponse } from '@domain/entities/account';
import { Account } from '@domain/entities/account';
import { DuplicateError, NotFoundError } from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';

export class CreateAccountUseCase implements ICreateAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(request: CreateAccountRequest): Promise<AccountResponse> {
    const user = await this.authRepository.findUserById(request.userId);
    if (!user) {
      throw new NotFoundError('User', request.userId);
    }

    const accountNumber = await this.generateUniqueAccountNumber();

    const account = Account.create(request.userId, accountNumber);

    const savedAccount = await this.accountRepository.save(account);

    return {
      id: savedAccount.id || 0,
      userId: savedAccount.userId,
      accountNumber: savedAccount.accountNumber,
      balance: savedAccount.balance,
      createdAt: savedAccount.createdAt,
    };
  }

  private async generateUniqueAccountNumber(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const accountNumber = this.generateRandomAccountNumber();

      const existingAccount = await this.accountRepository.findByAccountNumber(accountNumber);

      if (!existingAccount) {
        return accountNumber;
      }

      attempts++;
    }

    throw new Error('Unable to generate unique account number after multiple attempts');
  }

  private generateRandomAccountNumber(): string {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, '0');

    return firstDigit + remainingDigits;
  }
}
