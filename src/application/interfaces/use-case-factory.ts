import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  ICreateAccountUseCase,
  IGetAccountsByUserIdUseCase,
} from './account-use-cases';
import type { IAuthUseCase } from './auth-use-cases';
import type {
  ICreateUserUseCase,
  IDeleteUserUseCase,
  IGetUserByIdUseCase,
  IUpdateUserUseCase,
} from './user-use-cases';

export interface IContainer {
  getAuthUseCase(): IAuthUseCase;
  getCreateAccountUseCase(): ICreateAccountUseCase;
  getGetAccountsByUserIdUseCase(): IGetAccountsByUserIdUseCase;
  getAccountDepositUseCase(): IAccountDepositUseCase;
  getAccountWithdrawUseCase(): IAccountWithdrawUseCase;
  // User management use cases
  getUserByIdUseCase(): IGetUserByIdUseCase;
  getCreateUserUseCase(): ICreateUserUseCase;
  getUpdateUserUseCase(): IUpdateUserUseCase;
  getDeleteUserUseCase(): IDeleteUserUseCase;
}
