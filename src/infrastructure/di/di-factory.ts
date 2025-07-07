import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  ICreateAccountUseCase,
  IGetAccountsByUserIdUseCase,
} from '@application/interfaces/account-use-cases';
import type { IAuthUseCase } from '@application/interfaces/auth-use-cases';
import type {
  ICreateUserUseCase,
  IDeleteUserUseCase,
  IGetUserByIdUseCase,
  IListUsersUseCase,
  IUpdateUserUseCase,
} from '@application/interfaces/user-use-cases';
import { AccountController } from '@controllers/account-controller';
import { AuthController } from '@controllers/auth-controller';
import { UserController } from '@controllers/user-controller';
import { Container } from '@infrastructure/container';

/**
 * Dependency Injection Factory
 * This class is responsible for creating controllers with properly injected dependencies
 * following Clean Architecture principles
 */
export class DIFactory {
  private static instance: DIFactory;
  private readonly container: Container;

  private constructor() {
    this.container = Container.getInstance();
  }

  public static getInstance(): DIFactory {
    if (!DIFactory.instance) {
      DIFactory.instance = new DIFactory();
    }
    return DIFactory.instance;
  }

  /**
   * Creates AuthController with injected dependencies
   */
  public createAuthController(): AuthController {
    const authUseCase = this.container.getAuthUseCase();
    return new AuthController(authUseCase);
  }

  /**
   * Creates AccountController with injected dependencies
   */
  public createAccountController(): AccountController {
    const createAccountUseCase = this.container.getCreateAccountUseCase();
    const getAccountsByUserIdUseCase = this.container.getGetAccountsByUserIdUseCase();
    const accountDepositUseCase = this.container.getAccountDepositUseCase();
    const accountWithdrawUseCase = this.container.getAccountWithdrawUseCase();

    return new AccountController(
      createAccountUseCase,
      getAccountsByUserIdUseCase,
      accountDepositUseCase,
      accountWithdrawUseCase,
    );
  }

  /**
   * Creates UserController with injected dependencies
   */
  public createUserController(): UserController {
    const getUserByIdUseCase = this.container.getUserByIdUseCase();
    const createUserUseCase = this.container.getCreateUserUseCase();
    const updateUserUseCase = this.container.getUpdateUserUseCase();
    const deleteUserUseCase = this.container.getDeleteUserUseCase();
    const listUsersUseCase = this.container.getListUsersUseCase();

    return new UserController(
      getUserByIdUseCase,
      createUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
      listUsersUseCase,
    );
  }
}
