import type {
  CreateAccountRequest,
  ICreateAccountUseCase,
} from '@application/interfaces/account-use-cases';
import { generateAccountNumber } from '@domain/common/account-number-generator';
import type { AccountResponse } from '@domain/entities/account';
import { Account } from '@domain/entities/account';
import { DuplicateError, NotFoundError } from '@domain/errors/domain-errors';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';

export class CreateAccountUseCase implements ICreateAccountUseCase {
  private user: any;

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(request: CreateAccountRequest): Promise<AccountResponse> {
    this.user = await this.authRepository.findUserById(request.userId);
    if (!this.user) {
      throw new NotFoundError('User', request.userId);
    }

    const accountNumber = this.generateUniqueAccountNumber();

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

  private generateUniqueAccountNumber(): string {
    return generateAccountNumber(this.user.id);
  }
}
