import type {
  ICreateAccountUseCase,
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  IGetAccountsByUserIdUseCase,
} from './account-use-cases';
import type { IAuthUseCase } from './auth-use-cases';
import type {
  IGetUserByIdUseCase,
  ICreateUserUseCase,
  IUpdateUserUseCase,
  IDeleteUserUseCase,
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
