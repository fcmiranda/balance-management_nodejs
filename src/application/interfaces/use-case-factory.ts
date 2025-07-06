import type {
  ICreateClientUseCase,
  IGetAllClientsUseCase,
  IGetClientByIdUseCase,
  IUpdateClientUseCase,
  IDeleteClientUseCase,
  IDepositUseCase,
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
}
