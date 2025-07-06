import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  IGetAccountsByUserIdUseCase,
} from './account-use-cases';
import type { IAuthUseCase } from './auth-use-cases';

export interface IContainer {
  getAuthUseCase(): IAuthUseCase;
  getGetAccountsByUserIdUseCase(): IGetAccountsByUserIdUseCase;
  getAccountDepositUseCase(): IAccountDepositUseCase;
  getAccountWithdrawUseCase(): IAccountWithdrawUseCase;
}
