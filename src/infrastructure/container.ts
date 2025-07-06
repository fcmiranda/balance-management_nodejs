import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import type { IAuthUseCase } from '@application/interfaces/auth-use-cases';
import type { IContainer } from '@application/interfaces/use-case-factory';
import { AccountDepositUseCase } from '@application/use-cases/account-deposit-use-case';
import { AccountWithdrawUseCase } from '@application/use-cases/account-withdraw-use-case';
import { AuthUseCase } from '@application/use-cases/auth-use-case';
import { GetAccountsByUserIdUseCase } from '@application/use-cases/get-accounts-by-user-id-use-case';
import type { AccountRepository } from '@domain/repositories/account-repository';
import type { AuthRepository } from '@domain/repositories/auth-repository';
import { AuthService } from './auth/auth-service';
import { TypeOrmAccountRepository } from './repositories/typeorm-account-repository';
import { TypeOrmAuthRepository } from './repositories/typeorm-auth-repository';

export class Container implements IContainer {
  private static instance: Container;
  private readonly accountRepository: AccountRepository;
  private readonly authRepository: AuthRepository;
  private readonly authService: AuthService;

  private readonly authUseCase: IAuthUseCase;
  private readonly getAccountsByUserIdUseCase: IGetAccountsByUserIdUseCase;
  private readonly accountDepositUseCase: IAccountDepositUseCase;
  private readonly accountWithdrawUseCase: IAccountWithdrawUseCase;

  private constructor() {
    this.accountRepository = new TypeOrmAccountRepository();
    this.authRepository = new TypeOrmAuthRepository();
    this.authService = new AuthService();

    this.authUseCase = new AuthUseCase(this.authRepository, this.authService);
    this.getAccountsByUserIdUseCase = new GetAccountsByUserIdUseCase(this.accountRepository);
    this.accountDepositUseCase = new AccountDepositUseCase(this.accountRepository);
    this.accountWithdrawUseCase = new AccountWithdrawUseCase(this.accountRepository);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public getAuthUseCase(): IAuthUseCase {
    return this.authUseCase;
  }

  public getGetAccountsByUserIdUseCase(): IGetAccountsByUserIdUseCase {
    return this.getAccountsByUserIdUseCase;
  }

  public getAccountDepositUseCase(): IAccountDepositUseCase {
    return this.accountDepositUseCase;
  }

  public getAccountWithdrawUseCase(): IAccountWithdrawUseCase {
    return this.accountWithdrawUseCase;
  }
}
