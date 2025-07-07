import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  ICreateAccountUseCase,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import type { IAuthUseCase } from '@application/interfaces/auth-use-cases';
import type { IContainer } from '@application/interfaces/use-case-factory';
import type {
  ICreateUserUseCase,
  IDeleteUserUseCase,
  IGetUserByIdUseCase,
  IUpdateUserUseCase,
} from '@application/interfaces/user-use-cases';
import { AccountDepositUseCase } from '@application/use-cases/account-deposit-use-case';
import { AccountWithdrawUseCase } from '@application/use-cases/account-withdraw-use-case';
import { AuthUseCase } from '@application/use-cases/auth-use-case';
import { CreateAccountUseCase } from '@application/use-cases/create-account-use-case';
import { CreateUserUseCase } from '@application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from '@application/use-cases/delete-user-use-case';
import { GetAccountsByUserIdUseCase } from '@application/use-cases/get-accounts-by-user-id-use-case';
import { GetUserByIdUseCase } from '@application/use-cases/get-user-by-id-use-case';
import { UpdateUserUseCase } from '@application/use-cases/update-user-use-case';
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
  private readonly createAccountUseCase: ICreateAccountUseCase;
  private readonly getAccountsByUserIdUseCase: IGetAccountsByUserIdUseCase;
  private readonly accountDepositUseCase: IAccountDepositUseCase;
  private readonly accountWithdrawUseCase: IAccountWithdrawUseCase;

  // User management use cases
  private readonly getUserByIdUseCaseInstance: IGetUserByIdUseCase;
  private readonly createUserUseCaseInstance: ICreateUserUseCase;
  private readonly updateUserUseCaseInstance: IUpdateUserUseCase;
  private readonly deleteUserUseCaseInstance: IDeleteUserUseCase;

  private constructor() {
    this.accountRepository = new TypeOrmAccountRepository();
    this.authRepository = new TypeOrmAuthRepository();
    this.authService = new AuthService();

    this.authUseCase = new AuthUseCase(this.authRepository, this.authService);
    this.createAccountUseCase = new CreateAccountUseCase(
      this.accountRepository,
      this.authRepository,
    );
    this.getAccountsByUserIdUseCase = new GetAccountsByUserIdUseCase(this.accountRepository);
    this.accountDepositUseCase = new AccountDepositUseCase(this.accountRepository);
    this.accountWithdrawUseCase = new AccountWithdrawUseCase(this.accountRepository);

    // Initialize user management use cases
    this.getUserByIdUseCaseInstance = new GetUserByIdUseCase(this.authRepository);
    this.createUserUseCaseInstance = new CreateUserUseCase(this.authRepository, this.authService);
    this.updateUserUseCaseInstance = new UpdateUserUseCase(this.authRepository, this.authService);
    this.deleteUserUseCaseInstance = new DeleteUserUseCase(
      this.authRepository,
      this.accountRepository,
    );
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

  public getCreateAccountUseCase(): ICreateAccountUseCase {
    return this.createAccountUseCase;
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

  // User management use case getters
  public getUserByIdUseCase(): IGetUserByIdUseCase {
    return this.getUserByIdUseCaseInstance;
  }

  public getCreateUserUseCase(): ICreateUserUseCase {
    return this.createUserUseCaseInstance;
  }

  public getUpdateUserUseCase(): IUpdateUserUseCase {
    return this.updateUserUseCaseInstance;
  }

  public getDeleteUserUseCase(): IDeleteUserUseCase {
    return this.deleteUserUseCaseInstance;
  }
}
