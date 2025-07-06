import type {
  IAccountDepositUseCase,
  IAccountWithdrawUseCase,
  IGetAccountsByUserIdUseCase,
} from './account-use-cases';
import type { IAuthUseCase } from './auth-use-cases';
import type {
  ICreateClientUseCase,
  IDeleteClientUseCase,
  IDepositUseCase,
  IGetAllClientsUseCase,
  IGetClientByIdUseCase,
  IUpdateClientUseCase,
  IWithdrawUseCase,
} from './client-use-cases';

export interface IUseCaseFactory {
  createCreateClientUseCase(): ICreateClientUseCase;
  createGetAllClientsUseCase(): IGetAllClientsUseCase;
  createGetClientByIdUseCase(): IGetClientByIdUseCase;
  createUpdateClientUseCase(): IUpdateClientUseCase;
  createDeleteClientUseCase(): IDeleteClientUseCase;
  createDepositUseCase(): IDepositUseCase;
  createWithdrawUseCase(): IWithdrawUseCase;
}

export interface IContainer {
  getCreateClientUseCase(): ICreateClientUseCase;
  getGetAllClientsUseCase(): IGetAllClientsUseCase;
  getGetClientByIdUseCase(): IGetClientByIdUseCase;
  getUpdateClientUseCase(): IUpdateClientUseCase;
  getDeleteClientUseCase(): IDeleteClientUseCase;
  getDepositUseCase(): IDepositUseCase;
  getWithdrawUseCase(): IWithdrawUseCase;
  getAuthUseCase(): IAuthUseCase;
  getGetAccountsByUserIdUseCase(): IGetAccountsByUserIdUseCase;
  getAccountDepositUseCase(): IAccountDepositUseCase;
  getAccountWithdrawUseCase(): IAccountWithdrawUseCase;
}
